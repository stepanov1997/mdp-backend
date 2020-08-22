package server;

import soap.Application_PortType;
import soap.Application_ServiceLocator;

import javax.xml.rpc.ServiceException;
import java.io.*;
import java.rmi.Naming;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.server.UnicastRemoteObject;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

public class FileServer implements IFileServer { // 1
    private static final Logger LOGGER = Logger.getLogger(FileServer.class.getName());
    private static final String CONFIG_URL = "rmi/src/server/config.properties";
    
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
            LOGGER.log(Level.WARNING, "No files.", ex);
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
            LOGGER.log(Level.WARNING, "Cannot write file...", ex);
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
            LOGGER.log(Level.WARNING, "Cannot read file...", ex);
            return null;
        }
        return buffer;
    }

    private boolean checkToken(String token) {
        Application_ServiceLocator asl = new Application_ServiceLocator();
        try {
            Application_PortType apt = asl.getApplication();
            if (apt.checkToken(token) == null) {
                LOGGER.log(Level.WARNING, "Token is not valid.");
                System.out.println("Token is not valid.");
                return false;
            }
        } catch (RemoteException | ServiceException e) {
            LOGGER.log(Level.WARNING, "Token server is offline.", e);
            return false;
        }
        return true;
    }

    public static void main(String[] args) {
        System.setProperty("java.security.policy", "server.policy");

        FileReader reader= null;
        try {
            reader = new FileReader(CONFIG_URL);
        } catch (FileNotFoundException e) {
            LOGGER.log(Level.WARNING, "Property file does not exist.", e);
        }
        Properties p=new Properties();
        try {
            p.load(reader);
        } catch (IOException e) {
            LOGGER.log(Level.WARNING, "Property file does not exist.", e);
        }
        System.setProperty("java.rmi.server.hostname", p.getProperty("RMI_ADDRESS"));
        try {
            String name = "FileServer";
            FileServer srv = new FileServer(); // 3
            IFileServer stub = (IFileServer) UnicastRemoteObject.exportObject(srv, 0); // 4


            LocateRegistry.createRegistry(Integer.parseInt(p.getProperty("RMI_PORT"))); // 5
            Naming.rebind("//"+p.getProperty("RMI_ADDRESS")+"/" + name, stub); // 6
            LOGGER.log(Level.INFO, "File server is ready!");
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "File server can't start.", e);
        }
    }
}
