package server;

import java.rmi.Naming;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.UnicastRemoteObject;

public class CalculatorServer implements CalculatorI {			// 1
	public CalculatorServer() throws RemoteException {
		super();
	}

	public int add(int x, int y) throws RemoteException {
		return x + y;
	}

	public int sub(int x, int y) throws RemoteException {
		return x - y;
	}

	public static void main(String[] args) {
		System.setProperty("java.security.policy", "server.policy");
		System.setProperty("java.rmi.server.hostname", "pisio.etfbl.net");
		try {
			String name = "Calculator";
			CalculatorServer srv = new CalculatorServer();											// 3
			CalculatorI stub = (CalculatorI) UnicastRemoteObject.exportObject(srv, 0);					// 4
			LocateRegistry.createRegistry(1099);													// 5
			Naming.rebind("//pisio.etfbl.net/" + name, stub);											// 6
			// Registry rg = LocateRegistry.getRegistry();											// 7
			// rg.rebind(name, stub);																// 8
			System.out.println("CalculatorServer ready");
		} catch (Exception e) {
			System.err.println("CalculatorServer exception:");
			e.printStackTrace();
		}
	}
}

