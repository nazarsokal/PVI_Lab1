<?php
require_once '../core/Controller.php';
require_once '../models/User.php';

class UserController extends Controller {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function profile($id) {
        $user = $this->userModel->getById($id);
        if ($user) {
            $this->jsonResponse($user);
        } else {
            $this->jsonResponse(['error' => 'User not found'], 404);
        }
    }
}
?>