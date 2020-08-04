using System;
using System.Collections.Generic;
using System.Net.Sockets;

namespace SocketServer
{
    public class MedicClient : IEquatable<MedicClient>
    {
        public TcpClient CurrentClient { get; set; } = null;
        public PersonClient PersonClient { get; set; } = null;
        public MedicClient() : base() { }

        public override bool Equals(object obj)
        {
            return Equals(obj as MedicClient);
        }

        public bool Equals(MedicClient other)
        {
            return other != null &&
                   EqualityComparer<TcpClient>.Default.Equals(CurrentClient, other.CurrentClient) &&
                   EqualityComparer<PersonClient>.Default.Equals(PersonClient, other.PersonClient);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(CurrentClient, PersonClient);
        }
    }
}