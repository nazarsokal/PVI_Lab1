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
        $stmt = $this->db->prepare('INSERT INTO students (id, StudentGroup, firstName, lastName, gender, birthday) 
                                    VALUES (:id, :StudentGroup, :firstName, :lastName, :gender, :birthday)');
        return $stmt->execute([
            'id' => $data['id'],
            'StudentGroup' => $data['StudentGroup'],
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'gender' => $data['gender'],
            'birthday' => $data['birthday']
        ]);
    }
    
    public function loginStudent($data) {
        $stmt = $this->db->prepare('SELECT * FROM student WHERE firstName = :firstName AND lastName = :lastName AND birthday = :birthday');
        $stmt->execute([
            ':firstName' => $data['firstName'],
            ':lastName'=> $data['lastName'],
            ':birthday'=> $data['birthday'],
        ]);

        $student = $stmt->fetch(PDO::FETCH_ASSOC);
        return $student;
    }

    public function update($data) {
        error_log('Student To Update: '. print_r($data, true));
        $stmt = $this->db->prepare('UPDATE students 
                                    SET StudentGroup = :StudentGroup, firstName = :firstName, lastName = :lastName, gender = :gender, birthday = :birthday 
                                    WHERE id = :id');
        return $stmt->execute([
            ':id' => $data['id'],
            ':StudentGroup' => $data['StudentGroup'],
            ':firstName' => $data['firstName'],
            ':lastName' => $data['lastName'],
            ':gender' => $data['gender'],
            ':birthday' => $data['birthday']
        ]);
    }

    public function delete($id) {
        error_log('ID: '. print_r($id, true));
    
        if (is_array($id)) {
            // Multiple IDs: create placeholders
            $placeholders = implode(',', array_fill(0, count($id), '?'));
            $stmt = $this->db->prepare("DELETE FROM students WHERE id IN ($placeholders)");
            return $stmt->execute($id);
        } else {
            // Single ID
            $stmt = $this->db->prepare('DELETE FROM students WHERE id = ?');
            return $stmt->execute([$id]);
        }
    }
    
}
?>
