<?php
class Controller {
    protected function jsonResponse($data, $statusCode = 200) {
        header('Content-Type: application/json', true, $statusCode);
        echo json_encode($data);
        exit;
    }
}
?>