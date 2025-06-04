<?php
require_once '../core/Controller.php';
require_once '../models/Student.php';

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");

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
    
        if (!$this->isValidName($input['firstName'])) {
            $this->jsonResponse(['error' => 'Ім’я не повинно містити цифри або спецсимволи.'], 400);
        }
    
        if (!$this->isValidName($input['lastName'])) {
            $this->jsonResponse(['error' => 'Прізвище не повинно містити цифри або спецсимволи.'], 400);
        }
    
        if (!$this->isValidDate($input['birthday'])) {
            $this->jsonResponse(['error' => 'Невірний формат дати. Використовуйте YYYY-MM-DD.'], 400);
        }
    
        if ($this->studentModel->studentExists($input['firstName'], $input['lastName'])) {
            $this->jsonResponse(['error' => 'Такий студент вже існує'], 400);
        }
    
        if ($this->studentModel->create($input)) {
            $this->jsonResponse(['message' => 'Студента додано'], 201);
        } else {
            $this->jsonResponse(['error' => 'Помилка при збереженні студента'], 500);
        }
    }

    private function isValidName($name) {
        return preg_match("/^[a-zA-Zа-яА-ЯіїєґІЇЄҐ' -]+$/u", $name);
    }
    
    private function isValidDate($date) {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
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
    
        if ($this->studentModel->studentExistsExceptId($input['firstName'], $input['lastName'], $input['id'])) {
            $this->jsonResponse(['error' => 'Another student with the same data already exists'], 400);
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
