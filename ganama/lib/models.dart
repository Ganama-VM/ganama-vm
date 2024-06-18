class Application {
  final String applicationId;
  final int port;

  Application(this.applicationId, this.port);

  get url => 'http://localhost:$port';

  get safeDockerServiceName => applicationId.replaceAll(RegExp(r'/|\:'), '-');
}
