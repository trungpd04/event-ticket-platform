import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiClient {
  ApiClient({String? token}) : _token = token;

  static const baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:8081',
  );

  final String? _token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> post({required String path, required Map<String, dynamic> body}) async {
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: _headers,
      body: jsonEncode(body),
    );
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    _ensureSuccess(response.statusCode, data);
    return data;
  }

  Future<dynamic> get(String path) async {
    final response = await http.get(Uri.parse('$baseUrl$path'), headers: _headers);
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    _ensureSuccess(response.statusCode, data);
    return data['data'];
  }

  void _ensureSuccess(int statusCode, Map<String, dynamic> data) {
    if (statusCode < 200 || statusCode >= 300 || data['success'] == false) {
      throw Exception(data['message'] ?? 'Không thể thực hiện yêu cầu');
    }
  }
}
