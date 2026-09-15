import asyncio
import os
import sys

# Ensure backend source is in sys.path
sys.path.insert(0, os.path.abspath("src"))

import httpx
from backend.main import app

BASE_URL = "http://testserver"


async def main():
    print("=" * 60)
    print("PHASE 6: AI RAG POLICY CHATBOT & EMBEDDINGS E2E TEST")
    print("=" * 60)

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url=BASE_URL) as client:
        # Step 1: Register Company A (Acme Tech) and Company B (Nova Corp)
        print("\n[1] Registering Company A (Acme Tech) & Company B (Nova Corp)...")
        res_a = await client.post("/api/v1/auth/register-company", json={
            "company_name": f"Acme Tech {os.urandom(2).hex()}",
            "email": f"alice_{os.urandom(3).hex()}@acme.com",
            "password": "Password123!",
        })
        assert res_a.status_code == 201, f"Company A registration failed: {res_a.text}"
        data_a = res_a.json()
        token_a_owner = data_a["access_token"]
        auth_a_owner = {"Authorization": f"Bearer {token_a_owner}"}
        company_a_id = data_a["user"]["company_id"]

        res_b = await client.post("/api/v1/auth/register-company", json={
            "company_name": f"Nova Corp {os.urandom(2).hex()}",
            "email": f"bob_{os.urandom(3).hex()}@nova.com",
            "password": "Password123!",
        })
        assert res_b.status_code == 201, f"Company B registration failed: {res_b.text}"
        data_b = res_b.json()
        token_b_owner = data_b["access_token"]
        auth_b_owner = {"Authorization": f"Bearer {token_b_owner}"}
        company_b_id = data_b["user"]["company_id"]

        print(f"  Company A created (ID: {company_a_id})")
        print(f"  Company B created (ID: {company_b_id})")

        # Step 2: Add an employee to Company A
        print("\n[2] Creating an Employee under Company A...")
        emp_email = f"emp_{os.urandom(3).hex()}@acme.com"
        res_emp = await client.post("/api/v1/users", json={
            "email": emp_email,
            "full_name": "Evan Employee",
            "role": "EMPLOYEE",
            "job_title": "Frontend Engineer",
        }, headers=auth_a_owner)
        assert res_emp.status_code == 201
        temp_pwd = res_emp.json()["temporary_password"]

        # Login as employee
        res_emp_login = await client.post("/api/v1/auth/login", json={
            "email": emp_email,
            "password": temp_pwd,
        })
        assert res_emp_login.status_code == 200
        token_a_emp = res_emp_login.json()["access_token"]
        auth_a_emp = {"Authorization": f"Bearer {token_a_emp}"}
        print("  Employee logged in successfully.")

        # Step 3: Test RBAC - Employee cannot upload policy documents
        print("\n[3] Verifying RBAC: Employee attempt to upload policy should be 403 Forbidden...")
        res_forbidden = await client.post("/api/v1/policies/text", json={
            "document_name": "Hacked Policy",
            "content": "Employees can do whatever they want all day.",
        }, headers=auth_a_emp)
        assert res_forbidden.status_code == 403, f"Expected 403, got {res_forbidden.status_code}"
        print("  Employee blocked as expected (HTTP 403).")

        # Step 4: Company A Owner uploads Acme Policy
        print("\n[4] Company A Owner uploads Acme Remote Work & Leave Handbook...")
        acme_policy = (
            "Acme Tech Remote Work and Office Hours Policy:\n"
            "1. Remote Work: Acme Tech employees are granted 20 days of remote work (work-from-home) per calendar year.\n"
            "2. Core Hours: Working hours are flexible between 9:00 AM and 6:00 PM EST, with core collaboration hours from 10:00 AM to 3:00 PM EST.\n"
            "3. Dress Code: The office dress code is smart-casual. Fridays are casual dress.\n"
            "4. Equipment Allowance: Every full-time employee receives a $500 home-office equipment reimbursement after completing probation."
        )
        res_upload_a = await client.post("/api/v1/policies/text", json={
            "document_name": "Acme Employee Handbook 2026",
            "content": acme_policy,
        }, headers=auth_a_owner)
        assert res_upload_a.status_code == 201, f"Upload A failed: {res_upload_a.text}"
        print(f"  Company A policy uploaded: {res_upload_a.json()['chunks_created']} chunks created.")

        # Step 5: Company B Owner uploads Nova Policy (distinct rules)
        print("\n[5] Company B Owner uploads Nova Corp Workplace Guidelines...")
        nova_policy = (
            "Nova Corp In-Office Mandatory Attendance Policy:\n"
            "1. Attendance: All Nova Corp employees must work on-site at headquarters 5 days a week from 8:30 AM to 5:30 PM.\n"
            "2. Remote Work: Remote work is strictly prohibited except under government-declared emergencies.\n"
            "3. Dress Code: Mandatory business formal at all times (suits and ties for gentlemen, formal corporate attire for ladies).\n"
            "4. Overtime: Overtime must be pre-approved by Department Director 48 hours in advance."
        )
        res_upload_b = await client.post("/api/v1/policies/text", json={
            "document_name": "Nova Corporate Handbook",
            "content": nova_policy,
        }, headers=auth_b_owner)
        assert res_upload_b.status_code == 201, f"Upload B failed: {res_upload_b.text}"
        print(f"  Company B policy uploaded: {res_upload_b.json()['chunks_created']} chunks created.")

        # Step 6: Test Listing Policies (Accessible to Employee of Company A)
        print("\n[6] Testing policy document listing by Employee of Company A...")
        res_list = await client.get("/api/v1/policies", headers=auth_a_emp)
        assert res_list.status_code == 200
        docs_a = res_list.json()
        assert len(docs_a) == 1
        assert docs_a[0]["document_name"] == "Acme Employee Handbook 2026"
        print(f"  Company A policies listed: {[d['document_name'] for d in docs_a]}")

        # Step 7: Test File Upload via multipart/form-data (.txt file)
        print("\n[7] Testing multipart/form-data upload for Company A Owner...")
        leave_faq = (
            "Acme Tech Leave & Time-Off FAQ:\n"
            "- Sick Leave: 10 days annually. Medical certificate required for absences exceeding 3 consecutive days.\n"
            "- Planned Vacation: Must be requested at least 5 business days in advance.\n"
            "- Unpaid Leave: Employees who have exhausted their paid leave quotas may submit emergency/unpaid leave requests for review."
        )
        files = {"file": ("leave_faq.txt", leave_faq.encode("utf-8"), "text/plain")}
        res_file_upload = await client.post("/api/v1/policies/upload", files=files, headers=auth_a_owner)
        assert res_file_upload.status_code == 201, f"File upload failed: {res_file_upload.text}"
        print(f"  File uploaded successfully: {res_file_upload.json()}")

        # Check that Company A now has 2 documents
        res_list2 = await client.get("/api/v1/policies", headers=auth_a_emp)
        docs_a2 = res_list2.json()
        assert len(docs_a2) == 2
        print(f"  Company A now has documents: {[d['document_name'] for d in docs_a2]}")

        # Step 8: RAG Chatbot Tenant Isolation & In-Scope Query
        print("\n[8] Testing AI RAG Chatbot with Company A Employee: 'How many days of remote work do I get?'...")
        chat_req = {
            "question": "How many days of remote work am I allowed per year?",
            "history": [],
        }
        res_chat_a = await client.post("/api/v1/chat", json=chat_req, headers=auth_a_emp)
        assert res_chat_a.status_code == 200, f"Chat failed: {res_chat_a.text}"
        ans_a = res_chat_a.json()
        print(f"  AI Model: {ans_a['model']}")
        print(f"  Answer: {ans_a['answer']}")
        print(f"  Cited Sources: {[s['document_name'] for s in ans_a['sources']]}")
        # Verify it answered 20 days and only cited Acme
        assert "20" in ans_a["answer"], f"Expected '20' in answer: {ans_a['answer']}"
        for src in ans_a["sources"]:
            assert "Acme" in src["document_name"] or "leave_faq" in src["document_name"]
            assert "Nova" not in src["document_name"], "TENANT LEAK! Nova Corp policy was cited!"
        print("  TENANT ISOLATION CONFIRMED: Answer correctly references 20 days and only Acme sources!")

        # Step 9: RAG Chatbot with Company B Owner: 'Can I work remotely?'
        print("\n[9] Testing AI RAG Chatbot with Company B Owner: 'Can I work from home?'...")
        chat_req_b = {
            "question": "Can I work from home or remotely?",
            "history": [],
        }
        res_chat_b = await client.post("/api/v1/chat", json=chat_req_b, headers=auth_b_owner)
        assert res_chat_b.status_code == 200
        ans_b = res_chat_b.json()
        print(f"  Answer: {ans_b['answer']}")
        print(f"  Cited Sources: {[s['document_name'] for s in ans_b['sources']]}")
        for src in ans_b["sources"]:
            assert "Nova" in src["document_name"]
            assert "Acme" not in src["document_name"], "TENANT LEAK! Acme policy was cited for Company B!"
        print("  Company B isolation verified: Nova Corp sources only!")

        # Step 10: Chatbot Guardrail Test (Off-topic question refusal)
        print("\n[10] Testing AI Guardrails: Asking off-topic general question...")
        off_topic_req = {
            "question": "Write a quick Python script to calculate Fibonacci numbers and tell me what the capital of France is.",
            "history": [],
        }
        res_off_topic = await client.post("/api/v1/chat", json=off_topic_req, headers=auth_a_emp)
        assert res_off_topic.status_code == 200
        ans_off = res_off_topic.json()
        print(f"  Answer to off-topic prompt: {ans_off['answer']}")
        # The prompt guardrails instruct the model to refuse off-topic questions
        refusal_keywords = ["policy", "guideline", "leave", "cannot", "refuse", "assistant", "hr", "unrelated", "only"]
        refusal_detected = any(kw in ans_off["answer"].lower() for kw in refusal_keywords)
        assert refusal_detected, f"Guardrail did not activate: {ans_off['answer']}"
        print("  GUARDRAIL PASSED: Assistant correctly refused off-topic query.")

        # Step 11: Multi-turn ephemeral memory test
        print("\n[11] Testing Ephemeral In-Session History Context...")
        history_req = {
            "question": "Does it require a medical certificate?",
            "history": [
                {"role": "user", "content": "How many days of sick leave do I have?"},
                {"role": "assistant", "content": "You have 10 days of sick leave annually."},
            ],
        }
        res_history = await client.post("/api/v1/chat", json=history_req, headers=auth_a_emp)
        assert res_history.status_code == 200
        ans_hist = res_history.json()
        print(f"  Follow-up Answer: {ans_hist['answer']}")
        assert "3" in ans_hist["answer"] or "consecutive" in ans_hist["answer"].lower() or "medical" in ans_hist["answer"].lower()
        print("  MULTI-TURN EPHEMERAL CONTEXT TEST PASSED.")

        # Step 12: Owner deletes a policy document
        print("\n[12] Testing Policy Deletion by Owner...")
        res_del = await client.delete("/api/v1/policies/leave_faq.txt", headers=auth_a_owner)
        assert res_del.status_code == 200, f"Delete failed: {res_del.text}"
        print(f"  Deleted: {res_del.json()}")

        # Verify count decreased to 1
        res_list3 = await client.get("/api/v1/policies", headers=auth_a_emp)
        assert len(res_list3.json()) == 1
        print("  Policy deletion confirmed.")

    print("\n" + "=" * 60)
    print("ALL PHASE 6 TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
