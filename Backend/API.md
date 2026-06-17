# IPR Portal API List

---

### 1. Get All Patents
* **URL:** `GET http://localhost:5000/api/patents`
* **Response:**
  ```json
  {
    "success": true,
    "data": []
  }
  ```

---

### 2. Get Patent by ID
* **URL:** `GET http://localhost:5000/api/patents/:id`
* **Response:**
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

---

### 3. Add a New Patent
* **URL:** `POST http://localhost:5000/api/patents`
* **Request Body (JSON):**
  ```json
  {
    "applicationNo": "",
    "status": "",
    "inventorName": "",
    "patentTitle": "",
    "applicantName": "",
    "filedDate": "",
    "publicationDate": "",
    "publicationNo": "",
    "institueAffiliation": "",
    "driveLink": "",
    "year": 0,
    "patentType": "",
    "patentSession": "",
    "weblink": "",
    "country": "",
    "userId": 0
  }
  ```

---

### 4. Delete a Patent
* **URL:** `DELETE http://localhost:5000/api/patents/:id`
* **Response:**
  ```json
  {
    "success": true,
    "data": {}
  }
  ```
