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
        $this->jsonResponse($students);
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(['error' => 'Method not allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        error_log("Input: ". print_r($input, true));

        if ($this->studentModel->create($input)) {
            $this->jsonResponse(['message' => 'Student created'], 201);
        } else {
            $this->jsonResponse(['error' => 'Failed to create student'], 500);
        }
    }

    public function getStudent() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $this->jsonResponse(['error'=> 'Method not allowed'], 405);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $student = $this->studentModel->loginStudent($input);

        $this->jsonResponse($student);
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(['error' => 'Method not allowed'], 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        error_log('Student received by controller'. print_r($input, true));
        if (!$input) {
            $this->jsonResponse(['error' => 'Invalid input'], 400);
        }

        if ($this->studentModel->update($input)) {
            $this->jsonResponse(['message' => 'Student updated']);
        } else {
            $this->jsonResponse(['error' => 'Failed to update student'], 500);
        }
    }

    public function delete() {
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
            $this->jsonResponse(['error' => 'Method not allowed'], 405);
        }
    
        // Read raw input
        $input = json_decode(file_get_contents('php://input'), true);
    
        if (!isset($input['id'])) {
            $this->jsonResponse(['error' => 'No ID provided'], 400);
        }
    
        $id = $input['id'];
    
        error_log('ID: '. print_r($id, true));
    
        if ($this->studentModel->delete($id)) {
            $this->jsonResponse(['message' => 'Student deleted']);
        } else {
            $this->jsonResponse(['error' => 'Failed to delete student'], 500);
        }
    }
    
}
?>
