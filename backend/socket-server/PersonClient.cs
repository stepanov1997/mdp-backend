using System;
using System.Collections.Generic;
using System.Net.Security;
using System.Net.Sockets;

namespace SocketServer
{
	public class PersonClient : IEquatable<PersonClient>
    {
		public string Token { get; set; } = null;
		public (TcpClient, SslStream) CurrentClient { get; set; }
		public MedicClient MedicClient { get; set; } = null;

		public PersonClient() : base() { }

        public override bool Equals(object obj)
        {
            return Equals(obj as PersonClient);
        }

        public bool Equals(PersonClient other)
        {
            return other != null &&
                   Token == other.Token &&
                   EqualityComparer<(TcpClient, SslStream)>.Default.Equals(CurrentClient, other.CurrentClient) &&
                   EqualityComparer<MedicClient>.Default.Equals(MedicClient, other.MedicClient);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Token, CurrentClient, MedicClient);
        }
    }
}