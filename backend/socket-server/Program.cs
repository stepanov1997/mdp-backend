using System.Collections.Generic;
using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

class Program
{
    static readonly object _lock = new object();
    static readonly Dictionary<string, TcpClient> list_clients = new Dictionary<string, TcpClient>();

    static void Main(string[] args)
    {
        TcpListener ServerSocket = new TcpListener(IPAddress.Parse("0.0.0.0"), 8084);
        ServerSocket.Start();

        while (true)
        {
            TcpClient client = ServerSocket.AcceptTcpClient();
            Console.WriteLine("Someone connected!!");

            Thread thread = new Thread(() => handle_clients(client));
            thread.Start();
        }
    }

    public static void handle_clients(TcpClient tcpClient)
    {
        string username = "";
        string usernameSagovornika = "";
        try
        {
            Thread.Sleep(1000);
            TcpClient client = tcpClient;

            NetworkStream stream = client.GetStream();

            // username
            while (true)
            {
                Console.WriteLine("username");
                byte[] buffer = Encoding.UTF8.GetBytes("[Server] Unesite vaše korisnicko ime:");
                stream.Write(buffer, 0, buffer.Length);

                buffer = new byte[1024];
                int byte_count = stream.Read(buffer, 0, buffer.Length);

                if (byte_count == 0)
                {
                    continue;
                }
                string data = Encoding.UTF8.GetString(buffer, 0, byte_count);

                Console.WriteLine(data);
                username = data.Replace("\n", "").Replace("\r", "");

                lock (_lock) list_clients.Add(username, client);
                break;
            }

            // username sagovornika
            while (true)
            {
                Console.WriteLine("sagovornik");
                byte[] buffer = Encoding.UTF8.GetBytes("[Server] Unesite korisnicko ime sagovornika:");
                stream.Write(buffer, 0, buffer.Length);

                buffer = new byte[1024];
                int byte_count = stream.Read(buffer, 0, buffer.Length);

                if (byte_count == 0)
                {
                    continue;
                }

                string data = Encoding.UTF8.GetString(buffer, 0, byte_count);

                usernameSagovornika = data.Replace("\n", "").Replace("\r", "");
                break;
            }

            while (!list_clients.ContainsKey(usernameSagovornika))
            {
                Console.WriteLine("cekanje");
                Thread.Sleep(1000);
            }

            while (true)
            {
                Console.WriteLine("razgovor");
                TcpClient sagovornik = list_clients[usernameSagovornika];
                NetworkStream streamSagovornik = sagovornik.GetStream();

                byte[] buffer = new byte[1024];
                int byte_count = streamSagovornik.Read(buffer, 0, buffer.Length);
                string data = Encoding.UTF8.GetString(buffer, 0, byte_count);

                buffer = Encoding.UTF8.GetBytes($"[{usernameSagovornika}]: {data}");
                stream.Write(buffer, 0, buffer.Length);
                if (data == "END")
                {
                    break;
                }
            }
        }
        catch (Exception)
        {
            Console.WriteLine("Client ended session.");
        }
        finally
        {
            lock (_lock) list_clients.Remove(username);
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