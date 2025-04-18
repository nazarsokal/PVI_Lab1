<?php
class Router {
    public function route() {
        $url = isset($_GET['url']) ? rtrim($_GET['url'], '/') : '';
        error_log("Requested URL: $url");
        $url = explode('/', $url);

        // Handle /api/ prefix
        if ($url[0] === 'api' && isset($url[1])) {
            array_shift($url); // Remove 'api'
        }

        // Default controller and method
        $controllerName = !empty($url[0]) ? ucfirst($url[0]) . 'Controller' : 'StudentController';
        $method = isset($url[1]) ? $url[1] : 'index';
        $params = array_slice($url, 2);
        error_log("ControllerName: $controllerName");
        // Load controller
        $controllerFile = '../Controllers/' . $controllerName . '.php';
        error_log("Trying to load controller: $controllerFile");
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
            $controller = new $controllerName;
            if (method_exists($controller, $method)) {
                call_user_func_array([$controller, $method], $params);
            } else {
                $this->jsonResponse(['error' => 'Method not found'], 404);
            }
        } else {
            error_log("Controller file not found: $controllerFile");
            $this->jsonResponse(['error' => 'Controller not found'], 404);
        }
    }

    private function jsonResponse($data, $statusCode = 200) {
        header('Content-Type: application/json', true, $statusCode);
        echo json_encode($data);
        exit;
    }
}
?>