package server;

import soap.Application_PortType;
import soap.Application_ServiceLocator;

import javax.xml.rpc.ServiceException;
import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.rmi.Naming;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.server.UnicastRemoteObject;
import java.util.*;
import java.util.stream.Collectors;

public class FileServer implements IFileServer { // 1

    public FileServer() throws RemoteException {
        super();
    }

    @Override
    public HashMap<String, Long> getFilePathsForToken(String token) throws RemoteException {
        try {
            File file = new File("files" + File.separator + token);
            LinkedHashMap<String, Long> collect = Arrays.stream(Objects.requireNonNull(file.listFiles()))
                    .sorted((a, b) -> (int) (b.lastModified() - a.lastModified()))
                    .map(elem -> new AbstractMap.SimpleEntry<>(elem.getName(), elem.length()))
                    .limit(5)
                    .collect(Collectors.toMap(
                            AbstractMap.SimpleEntry::getKey,
                            AbstractMap.SimpleEntry::getValue,
                            (x, y)
                                    -> x,
                            LinkedHashMap::new)
                    );
            return collect;
        } catch (NullPointerException ex) {
            return new HashMap<>();
        }
    }

    public boolean uploadFileOnServer(String token, String filename, byte[] data, long offset) throws RemoteException {
        if (!checkToken(token)) {
            return false;
        }

        System.out.println(filename);
        File file = new File("files" + File.separator + token + File.separator + filename);
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        try (RandomAccessFile raf = new RandomAccessFile(file, "rw")) {
            raf.seek(offset);
            raf.write(data, 0, data.length);
        } catch (IOException ex) {
            System.out.println("Failed file write: " + filename);
            return false;
        }

        return true;
    }

    public byte[] downloadFileFromServer(String token, String filename, long offset, int count) throws RemoteException {
        if (!checkToken(token)) {
            return null;
        }
        File file = new File("files"+File.separator+token+File.separator+filename);
        byte[] buffer = new byte[count];
        try (RandomAccessFile raf = new RandomAccessFile(file, "r")) {
            raf.seek(offset);
            raf.read(buffer, 0, count);
        } catch (IOException ex) {
            System.out.println("Failed file read: " + filename);
            return null;
        }
        return buffer;
    }

    private boolean checkToken(String token) {
        Application_ServiceLocator asl = new Application_ServiceLocator();
        try {
            Application_PortType apt = asl.getApplication();
            if (apt.checkToken(token) == null) {
                System.out.println("Token is not valid.");
                return false;
            }
        } catch (RemoteException | ServiceException e) {
            System.out.println("Token is not valid.");
            return false;
        }
        return true;
    }

    public static void main(String[] args) {
        System.setProperty("java.security.policy", "server.policy");
        System.setProperty("java.rmi.server.hostname", "0.0.0.0");
        try {
            String name = "FileServer";
            FileServer srv = new FileServer(); // 3
            IFileServer stub = (IFileServer) UnicastRemoteObject.exportObject(srv, 0); // 4
            LocateRegistry.createRegistry(1099); // 5
            Naming.rebind("//0.0.0.0/" + name, stub); // 6
            System.out.println("File server is ready!");
        } catch (Exception e) {
            System.err.println("FileServer exception:");
            e.printStackTrace();
        }
    }
}
