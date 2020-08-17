using System.Collections.Generic;
using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Linq;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Security.Authentication;
using System.IO;

namespace SocketServer
{
    class Program
    {
        static readonly object _lock = new object();
        static readonly Dictionary<string, PersonClient> list_clients = new Dictionary<string, PersonClient>();
        static readonly Queue<MedicClient> freeMedicsQueue = new Queue<MedicClient>();

        static void Main(string[] args)
        {
            Task.Run(async () =>
            {
                TcpListener listenerForPeople = new TcpListener(IPAddress.Parse("0.0.0.0"), 8084);
                TcpListener listenerForMedics = new TcpListener(IPAddress.Parse("0.0.0.0"), 8085);

                listenerForPeople.Start();
                listenerForMedics.Start();

                Task peopleTask = Task.Run(() =>
                {
                    while (true)
                    {
                        TcpClient client = listenerForPeople.AcceptTcpClient();
                        NetworkStream stream = client.GetStream();
                        Console.WriteLine("Someone connected!!");
                        Task.Run(async () => await handle_person(client));
                    }
                });
                Task medicTask = Task.Run(() =>
                {
                    while (true)
                    {
                        TcpClient client = listenerForMedics.AcceptTcpClient();
                        NetworkStream stream = client.GetStream();
                        Console.WriteLine("Medic connected!!");
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
                serverCertificate = new X509Certificate2(Path.GetFullPath(".") + "/keystore_server.p12", "sigurnost",
                X509KeyStorageFlags.Exportable | X509KeyStorageFlags.PersistKeySet);
            start:
                personClient = new PersonClient();
                MedicClient sagovornik = null;

                SslStream sslStream = new SslStream(
                tcpClient.GetStream());
                // Authenticate the server but don't require the client to authenticate.

                await sslStream.AuthenticateAsServerAsync(serverCertificate);

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

                    Console.WriteLine(data);
                    personClient.Token = data;

                    lock (_lock) list_clients.Add(personClient.Token, personClient);
                    break;
                }

                while (true)
                {
                    if (freeMedicsQueue.Count > 0)
                    {
                        sagovornik = freeMedicsQueue.Dequeue();
                        personClient.MedicClient = sagovornik;
                        sagovornik.PersonClient = personClient;
                        break;
                    }
                    Console.WriteLine("cekanje medica");
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

                    Console.WriteLine("[Medic]: " + data);

                    if (data.StartsWith("END"))
                    {
                        sagovornik.PersonClient = null;
                        personClient.MedicClient = null;
                        personClient.CurrentClient = (null,null);
                        break;
                    }
                }
                goto start;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                Console.WriteLine("Client ended session.");
                return;
            }
            finally
            {
                if (personClient?.Token != null)
                {
                    lock (_lock) list_clients.Remove(personClient.Token);
                }
                tcpClient.Client.Shutdown(SocketShutdown.Both);
                tcpClient.Close();
            }
        }

        public async static Task handle_medic(TcpClient tcpClient)
        {
            MedicClient medicClient = null;
            PersonClient personClient = null;
            X509Certificate2 serverCertificate = null;
            try
            {
                serverCertificate = new X509Certificate2(Path.GetFullPath(".") + "/keystore_server.p12", "sigurnost",
                X509KeyStorageFlags.Exportable | X509KeyStorageFlags.PersistKeySet);

            start:
                medicClient = new MedicClient();

                freeMedicsQueue.Enqueue(medicClient);

                SslStream sslStream = new SslStream(
                tcpClient.GetStream());

                await sslStream.AuthenticateAsServerAsync(serverCertificate);

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
                    Console.WriteLine("cekanje osobe");
                    await Task.Delay(1000);
                }

                while (medicClient.PersonClient != null)
                {
                    SslStream personSslStream = personClient.CurrentClient.Item2;

                    string data = "";
                    byte[] buffer = new byte[1024];
                    int byte_count = await personSslStream.ReadAsync(buffer, 0, buffer.Length);

                    data = Encoding.UTF8.GetString(buffer, 0, byte_count);

                    Console.WriteLine("[Person]: " + data);

                    buffer = Encoding.UTF8.GetBytes($"{data}");
                    await sslStream.WriteAsync(buffer, 0, buffer.Length);

                    if (data.StartsWith("END"))
                    {
                        break;
                    }
                }
                goto start;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                Console.WriteLine("Client ended session.");
                return;
            }
            finally
            {
                tcpClient.Client.Shutdown(SocketShutdown.Both);
                tcpClient.Close();
            }
        }

        /*public static void broadcast(string data)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(data + Environment.NewLine);

            lock (_lock)
            {
                foreach (TcpClient c in list_clients.Values)
                {
                    NetworkStream stream = c.GetStream();

                    stream.Write(buffer, 0, buffer.Length);
                }
            }
        }*/
    }
}