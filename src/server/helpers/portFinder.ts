import getPort from 'get-port';

interface PortFinder {
  port: number;
  userRequested: boolean;
}

export const portFinder = async (userPort: number): Promise<PortFinder> => {
  const pp = [3000, 4000, 5000, 6000, 7000, 8000, 9000, 3030, 4040, 5050, 6060, 7070, 8080, 9090];
  const availablePort = await getPort({ port: [userPort, ...pp], host: '127.0.0.1' });

  if (userPort !== availablePort) {
    console.log(`Port ${userPort} is not free. App will run on alternative free port.`);
  }

  return {
    port: availablePort,
    userRequested: userPort === availablePort,
  };
};
