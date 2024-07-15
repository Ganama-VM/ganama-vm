import 'package:ganama/models.dart';
import 'dart:io';
import 'package:front_matter_ml/front_matter_ml.dart' as fm;
import "package:path/path.dart" as path;

Future<int> getOpenPort() async {
  final socket = await ServerSocket.bind(InternetAddress.anyIPv4, 0);
  final port = socket.port;
  socket.close();
  return port;
}

Future<List<String>> findAllServicesUsed([Directory? directory]) async {
  directory = directory ?? Directory.current;

  final out = <String>["batandwaganama/ganama-services.messaging"];

  for (final fileSystemEntity in await directory.list().toList()) {
    if (fileSystemEntity is Directory &&
        !fileSystemEntity.path.contains(".ganama")) {
      out.addAll(await findAllServicesUsed(fileSystemEntity));
    } else if (fileSystemEntity is File &&
        fileSystemEntity.path.endsWith(".md")) {
      final fileContent = await fileSystemEntity.readAsString();
      final doc = fm.parse(fileContent);

      out.add(doc.data["llm"]);
      if (doc.data.keys.contains("services") &&
          doc.data["services"] is Iterable) {
        for (var iii = 0; iii < doc.data["services"].length; iii++) {
          out.add(doc.data["services"][iii]);
        }
      } else {
        // Layer does not declare services
      }
    }
  }

  return out;
}

Future<List<Application>> getApplications() async {
  final services = await findAllServicesUsed();
  final applicationIds =
      services.map((service) => service.split(".").first).toSet().toList();

  final futures = applicationIds.map(
    (applicationId) => (() async {
      final port = await getOpenPort();
      return Application(applicationId, port);
    })(),
  );

  return Future.wait(futures);
}

void ensureApplicationFoldersExist(List<Application> applications) {
  for (final application in applications) {
    final folder = Directory(path.join(
        Directory.current.path, ".ganama", application.safeDockerServiceName));

    if (folder.existsSync()) {
      // Do nothing as application folder already exists.
    } else {
      folder.createSync(recursive: true);
    }
  }
}

Future<Map<String, dynamic>> buildComposeJson(
    List<Application> applications) async {
  final vmPort = 3002;

  return {
    "version": '3',
    "services": {
      for (var application in applications)
        application.safeDockerServiceName: {
          "image": application.applicationId,
          "container_name": application.safeDockerServiceName,
          "volumes": [
            "./${application.safeDockerServiceName}:/ganama",
          ],
          "environment": [
            'VM_PORT=$vmPort',
            'PORT=${application.port}',
          ]
        },
      "vm": {
        "image": "batandwaganama/ganama-vm:latest",
        "container_name": "ganama-vm",
        "volumes": [
          "../:/ganama",
        ],
        "ports": ['$vmPort:$vmPort'],
        "environment": ['PORT=$vmPort'],
        "depends_on": applications
            .map(
              (application) => application.safeDockerServiceName,
            )
            .toList(),
      }
    }
  };
}

Map<String, dynamic> buildConfigJson(List<Application> applications) {
  final applicationJson = applications
      .map(
        (application) => {
          "id": application.safeDockerServiceName,
          "url": application.url,
          "image": application.applicationId,
        },
      )
      .toList();

  return {"applications": applicationJson};
}
