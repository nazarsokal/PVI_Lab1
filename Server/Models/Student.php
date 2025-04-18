<?php
require_once '../core/Model.php';

class Student extends Model {
    public function getAll() {
        $stmt = $this->db->prepare('SELECT * FROM students');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        error_log("Data received: ". print_r($data, true));
        $stmt = $this->db->prepare('INSERT INTO students (id, StudentGroup, firstName, lastName, gender, birthday) VALUES (:id, :StudentGroup, :firstName, :lastName, :gender, :birthday)');
        return $stmt->execute([
            'id' => $data['id'],
            'StudentGroup' => $data['StudentGroup'],
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'gender' => $data['gender'],
            'birthday' => $data['birthday']
        ]);
    }
}
?>