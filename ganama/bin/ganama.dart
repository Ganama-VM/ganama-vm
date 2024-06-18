import 'dart:convert';
import 'dart:io';
import "package:path/path.dart" as path;
import 'package:ganama/ganama.dart' as ganama;
import 'package:yaml_writer/yaml_writer.dart';

Future<void> main(List<String> arguments) async {
  final applications = await ganama.getApplications();
  ganama.ensureApplicationFoldersExist(applications);

  writeConfig(ganama.buildConfigJson(applications));
  writeComposeFile(await ganama.buildComposeJson(applications));
}

void writeConfig(Map<String, dynamic> json) {
  final file =
      File(path.join(Directory.current.path, ".ganama", "config.json"));
  file.writeAsStringSync(jsonEncode(json));
}

void writeComposeFile(Map<String, dynamic> json) {
  final file =
      File(path.join(Directory.current.path, ".ganama", "compose.yml"));
  final writer = YamlWriter();

  file.writeAsStringSync(writer.write(json));
}
