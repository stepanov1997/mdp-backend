using System.Collections.Generic;
using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.IO;
using Microsoft.Extensions.Logging;
using System.Configuration;

namespace SocketServer
{
    class Program
    {
        static readonly object _lock = new object();
        static readonly Dictionary<string, PersonClient> list_clients = new Dictionary<string, PersonClient>();
        static readonly Queue<MedicClient> freeMedicsQueue = new Queue<MedicClient>();

        static ILoggerFactory loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        static ILogger logger = loggerFactory.CreateLogger<Program>();

        static void Main(string[] args)
        {
            Task.Run(async () =>
            {
                logger.LogInformation("Server started...");
                logger.LogInformation("Waiting for clients...");
                int portForPeople = 8084;
                int portForMedics = 8085;
                if (!int.TryParse(ConfigurationManager.AppSettings["PeoplePort"], out portForPeople))
                    portForPeople = 8084;
                if (!int.TryParse(ConfigurationManager.AppSettings["MedicsPort"], out portForMedics))
                    portForMedics = 8085;

                TcpListener listenerForPeople = new TcpListener(IPAddress.Parse("0.0.0.0"), portForPeople);
                TcpListener listenerForMedics = new TcpListener(IPAddress.Parse("0.0.0.0"), portForMedics);
                listenerForPeople.Start();
                listenerForMedics.Start();

                Task peopleTask = Task.Run(() =>
                {
                    while (true)
                    {
                        TcpClient client = listenerForPeople.AcceptTcpClient();
                        NetworkStream stream = client.GetStream();
                        logger.LogInformation("Someone connected!!");
                        Task.Run(async () => await handle_person(client));
                    }
                });
                Task medicTask = Task.Run(() =>
                {
                    while (true)
                    {
                        TcpClient client = listenerForMedics.AcceptTcpClient();
                        NetworkStream stream = client.GetStream();
                        logger.LogInformation("Medic connected!!");
                        Task.Run(async () => await handle_medic(client));
                    }
                });
                await Task.WhenAll(new Task[] { peopleTask, medicTask });
            }).Wait();
        }

        public async static Task handle_person(TcpClient tcpClient)
        {
            PersonClient personClient = null;
            X509Certificate2 serverCertificate = null;
            try
            {
                serverCertificate = new X509Certificate2(Path.GetFullPath(".") + "/backend/socket-server/bin/Debug/netcoreapp3.1/keystore_server.p12", "sigurnost",
                X509KeyStorageFlags.Exportable | X509KeyStorageFlags.PersistKeySet);

                SslStream sslStream = new SslStream(tcpClient.GetStream());
                await sslStream.AuthenticateAsServerAsync(serverCertificate);

                personClient = new PersonClient();
                MedicClient sagovornik = null;

                personClient.CurrentClient = (tcpClient, sslStream);
                // token
                while (true)
                {
                    byte[] buffer = new byte[1024];
                    int byte_count = await sslStream.ReadAsync(buffer, 0, buffer.Length);

                    if (byte_count == 0)
                    {
                        continue;
                    }
                    string data = Encoding.UTF8.GetString(buffer, 0, byte_count);

                    personClient.Token = data;

                    lock (_lock) list_clients.Add(personClient.Token, personClient);
                    break;
                }

                while (true)
                {
                    if (freeMedicsQueue.Count > 0)
                    {
                        lock (_lock)
                        {
                            sagovornik = freeMedicsQueue.Dequeue();
                            personClient.MedicClient = sagovornik;
                            sagovornik.PersonClient = personClient;
                        }
                        break;
                    }
                    await Task.Delay(1000);
                }

                while (true)
                {
                    Console.WriteLine("razgovor");

                    SslStream sagovornikSslStream = sagovornik.CurrentClient.Item2;

                    string data = "";
                    byte[] buffer = new byte[1024];
                    int byte_count = await sagovornikSslStream.ReadAsync(buffer, 0, buffer.Length);

                    data = Encoding.UTF8.GetString(buffer, 0, byte_count);

                    buffer = Encoding.UTF8.GetBytes($"{data}");
                    await sslStream.WriteAsync(buffer, 0, buffer.Length);

                    if (data.StartsWith("END"))
                    {
                        break;
                    }
                }
            }
            catch (Exception)
            {
                logger.LogWarning("Client ended session. Token: " + personClient.Token);
               
                if (personClient?.Token != null)
                {
                    lock (_lock) list_clients.Remove(personClient.Token);
                    if (personClient.MedicClient != null)
                        personClient.MedicClient.PersonClient = null;
                    personClient.MedicClient = null;
                }
                tcpClient.Client.Shutdown(SocketShutdown.Both);
                tcpClient.Close();
                return;
            }
        }

        public async static Task handle_medic(TcpClient tcpClient)
        {
            MedicClient medicClient = null;
            PersonClient personClient = null;
            X509Certificate2 serverCertificate = null;
            try
            {
                serverCertificate = new X509Certificate2(Path.GetFullPath(".") + "/backend/socket-server/bin/Debug/netcoreapp3.1/keystore_server.p12", "sigurnost",
                X509KeyStorageFlags.Exportable | X509KeyStorageFlags.PersistKeySet);

                SslStream sslStream = new SslStream(tcpClient.GetStream());
                await sslStream.AuthenticateAsServerAsync(serverCertificate);

                medicClient = new MedicClient();

                while (true)
                {
                    freeMedicsQueue.Enqueue(medicClient);
                    medicClient.CurrentClient = (tcpClient, sslStream);

                    while (true)
                    {
                        lock (_lock)
                        {
                            if (medicClient.PersonClient != null)
                            {
                                personClient = medicClient.PersonClient;
                                break;
                            }
                        }
                        await Task.Delay(1000);
                    }

                    while (medicClient.PersonClient != null)
                    {
                        SslStream personSslStream = personClient.CurrentClient.Item2;

                        string data = "";
                        byte[] buffer = new byte[1024];
                        int byte_count = await personSslStream.ReadAsync(buffer, 0, buffer.Length);

                        data = Encoding.UTF8.GetString(buffer, 0, byte_count);

                        buffer = Encoding.UTF8.GetBytes($"{data}");
                        await sslStream.WriteAsync(buffer, 0, buffer.Length);
                    }
                }
            }
            catch (Exception e)
            {
                logger.LogError(e.StackTrace);
                Console.WriteLine("Client ended session.");
                tcpClient.Client.Shutdown(SocketShutdown.Both);
                tcpClient.Close();
                return;
            }
        }
    }
}