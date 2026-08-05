"""问答模块测试"""


class TestQA:
    def test_list_questions(self, client):
        response = client.get("/api/qa/questions")
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_get_question(self, client):
        response = client.get("/api/qa/questions/q-1")
        assert response.status_code == 200

    def test_get_question_not_found(self, client):
        response = client.get("/api/qa/questions/nonexistent")
        assert response.status_code == 404
        body = response.json()
        assert body["code"] == 2201

    def test_create_question(self, client, auth_headers):
        response = client.post("/api/qa/questions", json={"title": "Q?", "content": "body"}, headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == 0

    def test_create_answer(self, client, auth_headers):
        response = client.post("/api/qa/questions/q-1/answers", json={"content": "答案"}, headers=auth_headers)
        assert response.status_code == 200

    def test_accept_answer(self, client, auth_headers):
        response = client.post("/api/qa/answers/a-1/accept", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["data"]["is_accepted"] is True

    def test_accept_answer_not_found(self, client, auth_headers):
        response = client.post("/api/qa/answers/nonexistent/accept", headers=auth_headers)
        assert response.status_code == 404


class TestQAIntegration:
    def test_ask_answer_accept_flow(self, client, auth_headers):
        # 提问
        r = client.post("/api/qa/questions", json={"title": "集成测试问题", "content": "这是内容"}, headers=auth_headers)
        q_id = r.json()["data"]["id"]
        # 回答
        r = client.post(f"/api/qa/questions/{q_id}/answers", json={"content": "这是回答"}, headers=auth_headers)
        a_id = r.json()["data"]["id"]
        # 采纳
        r = client.post(f"/api/qa/answers/{a_id}/accept", headers=auth_headers)
        assert r.json()["data"]["is_accepted"] is True
