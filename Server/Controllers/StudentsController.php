<?php
require_once '../core/Controller.php';
require_once '../models/Student.php';

class StudentsController extends Controller {
    private $studentModel;

    public function __construct() {
        $this->studentModel = new Student();
    }

    public function index() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $this->jsonResponse(['error' => 'Method not allowed'], 405);
        }

        $students = $this->studentModel->getAll();
        // error_log('StudentsFromDb: '. print_r($students, true));
        $this->jsonResponse($students);
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(['error' => 'Method not allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        // if (!$input || !isset($input['name'], $input['email'], $input['grade'])) {
        //     $this->jsonResponse(['error' => 'Invalid input'], 400);
        // }
        $message = print_r($input, true);
        error_log("Input: ". $message);

        if ($this->studentModel->create($input)) {
            $this->jsonResponse(['message' => 'Student created'], 201);
        } else {
            $this->jsonResponse(['error' => 'Failed to create student'], 500);
        }
    }
}
?>