#!/usr/bin/env python3
"""Sequential live route tests for portfolio CMS APIs."""
from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from http.cookiejar import MozillaCookieJar
from pathlib import Path
from typing import Any

BASE = "http://127.0.0.1:3000"
API = f"{BASE}/api/v1"
EMAIL = "admin@barthez-kenwou.dev"
PASSWORD = "PortfolioAdmin!234"

COOKIE_JAR = MozillaCookieJar()
RESULTS: list[dict[str, Any]] = []


class Ctx:
    csrf: str = ""
    access: str = ""
    ids: dict[str, str] = {}


CTX = Ctx()


def req(
    method: str,
    path: str,
    *,
    body: dict | None = None,
    auth: bool = False,
    expect: int | set[int] = 200,
    name: str = "",
    csrf: bool = True,
) -> dict[str, Any]:
    url = path if path.startswith("http") else (BASE + path if path.startswith("/") else f"{API}/{path}")
    data = None
    headers = {"Accept": "application/json", "User-Agent": "portfolio-route-test/1.0"}
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if csrf and method.upper() not in {"GET", "HEAD", "OPTIONS"}:
        headers["X-XSRF-TOKEN"] = CTX.csrf
    if auth:
        headers["Authorization"] = f"Bearer {CTX.access}"

    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(COOKIE_JAR))
    request = urllib.request.Request(url, data=data, headers=headers, method=method.upper())
    started = time.perf_counter()
    status = 0
    payload: Any = None
    err = ""
    try:
        with opener.open(request, timeout=30) as resp:
            status = resp.status
            raw = resp.read().decode()
            # capture rotated access token if any
            auth_hdr = resp.headers.get("Authorization") or resp.headers.get("authorization")
            if auth_hdr and auth_hdr.lower().startswith("bearer "):
                CTX.access = auth_hdr.split(" ", 1)[1].strip()
            payload = json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        status = e.code
        raw = e.read().decode()
        try:
            payload = json.loads(raw) if raw else {"message": str(e)}
        except json.JSONDecodeError:
            payload = {"message": raw[:300]}
        err = payload.get("message") or payload.get("code") or str(e)
    except Exception as e:  # noqa: BLE001
        err = str(e)
        status = 0

    elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
    expected = expect if isinstance(expect, set) else {expect}
    ok = status in expected
    label = name or f"{method.upper()} {path}"
    RESULTS.append(
        {
            "name": label,
            "ok": ok,
            "status": status,
            "expect": sorted(expected),
            "ms": elapsed_ms,
            "error": err if not ok else "",
        }
    )
    mark = "OK " if ok else "FAIL"
    extra = f" :: {err[:120]}" if not ok else ""
    print(f"{mark} [{status}] {elapsed_ms:>6}ms  {label}{extra}")
    return payload if isinstance(payload, dict) else {"data": payload}


def refresh_csrf() -> None:
    data = req("GET", "/csrf-token", expect=200, name="GET /csrf-token", csrf=False)
    CTX.csrf = data.get("data", {}).get("csrfToken", "")
    if not CTX.csrf:
        raise SystemExit("Could not obtain CSRF token")


def login() -> None:
    refresh_csrf()
    data = req(
        "POST",
        "/api/v1/auth/login",
        body={"email": EMAIL, "password": PASSWORD},
        expect=200,
        name="POST /api/v1/auth/login",
    )
    # access token comes from Authorization response header (captured in req)
    if not CTX.access:
        # fallback: some builds put it in body
        CTX.access = (
            data.get("data", {}).get("accessToken")
            or data.get("data", {}).get("token")
            or ""
        )
    if not CTX.access:
        raise SystemExit("Login succeeded but no access token found")
    me = req("GET", "/api/v1/auth/me", auth=True, expect=200, name="GET /api/v1/auth/me")
    roles = me.get("data", {}).get("roles") or []
    if "super-admin" not in roles and "admin" not in roles:
        raise SystemExit(f"Admin role missing: {roles}")


def id_of(payload: dict) -> str:
    d = payload.get("data") or {}
    if isinstance(d, dict) and d.get("id"):
        return d["id"]
    if isinstance(d, dict) and isinstance(d.get("item"), dict):
        return d["item"].get("id", "")
    return ""


def main() -> int:
    print("=== Portfolio route smoke suite ===\n")
    # Health
    req("GET", "/health/live", expect=200, name="GET /health/live", csrf=False)
    req("GET", "/health", expect=200, name="GET /health", csrf=False)

    login()
    refresh_csrf()  # fresh token after login cookie churn

    # ---------- Contact Info (singleton) ----------
    contact_body = {
        "name": "Barthez Kenwou",
        "handle": "@barthez",
        "titleFr": "Développeur Full Stack",
        "titleEn": "Full Stack Developer",
        "subtitleFr": "DevOps & AWS",
        "subtitleEn": "DevOps & AWS",
        "email": "contact@barthez-kenwou.dev",
        "phone": "+237655646688",
        "whatsappLink": "https://wa.me/237655646688",
        "location": "Douala, Cameroun",
        "website": "https://barthez-kenwou.dev",
        "repository": "https://github.com/barthez-kenwou",
        "github": "https://github.com/barthez-kenwou",
        "linkedin": "https://linkedin.com/in/barthez-kenwou",
        "facebook": "https://facebook.com",
        "photoUrl": "https://barthez-kenwou.dev/me.jpg",
        "yearsExperience": 5,
        "tags": ["TypeScript", "AWS", "DevOps"],
    }
    req("PUT", "/api/v1/contact-infos", body=contact_body, auth=True, expect={200, 201}, name="PUT /contact-infos (upsert)")
    req("GET", "/api/v1/contact-infos", expect=200, name="GET /contact-infos (public)")

    # ---------- Skills ----------
    skill = req(
        "POST",
        "/api/v1/skills",
        auth=True,
        body={"name": "TypeScript", "category": "dev", "level": 90, "icon": "https://cdn.example.com/ts.svg", "sortOrder": 1},
        expect=201,
        name="POST /skills",
    )
    CTX.ids["skill"] = id_of(skill)
    req("GET", "/api/v1/skills", expect=200, name="GET /skills (public)")
    req("GET", f"/api/v1/skills/{CTX.ids['skill']}", expect=200, name="GET /skills/:id")
    req(
        "PUT",
        f"/api/v1/skills/{CTX.ids['skill']}",
        auth=True,
        body={"level": 95},
        expect=200,
        name="PUT /skills/:id",
    )

    # ---------- Services ----------
    service = req(
        "POST",
        "/api/v1/services",
        auth=True,
        body={
            "iconKey": "cloud",
            "titleFr": "Cloud AWS",
            "titleEn": "AWS Cloud",
            "descFr": "Architecture cloud",
            "descEn": "Cloud architecture",
            "featuresFr": ["VPC", "ECS"],
            "featuresEn": ["VPC", "ECS"],
            "priceEur": 80,
            "hourly": True,
            "priceFr": "80€/h",
            "priceEn": "€80/h",
            "isPublished": True,
            "sortOrder": 1,
        },
        expect=201,
        name="POST /services",
    )
    CTX.ids["service"] = id_of(service)
    req("GET", "/api/v1/services", expect=200, name="GET /services")
    req("GET", f"/api/v1/services/{CTX.ids['service']}", expect=200, name="GET /services/:id")
    req(
        "PUT",
        f"/api/v1/services/{CTX.ids['service']}",
        auth=True,
        body={"priceEur": 90},
        expect=200,
        name="PUT /services/:id",
    )

    # ---------- Experiences ----------
    exp = req(
        "POST",
        "/api/v1/experiences",
        auth=True,
        body={
            "titleFr": "Ingénieur Full Stack",
            "titleEn": "Full Stack Engineer",
            "companyFr": "Acme",
            "companyEn": "Acme",
            "period": "2023 — Present",
            "descriptionFr": ["Développement API"],
            "descriptionEn": ["API development"],
            "sortOrder": 1,
        },
        expect=201,
        name="POST /experiences",
    )
    CTX.ids["experience"] = id_of(exp)
    req("GET", "/api/v1/experiences", expect=200, name="GET /experiences")
    req("PUT", f"/api/v1/experiences/{CTX.ids['experience']}", auth=True, body={"period": "2022 — Present"}, expect=200, name="PUT /experiences/:id")

    # ---------- Education ----------
    edu = req(
        "POST",
        "/api/v1/education",
        auth=True,
        body={
            "degreeFr": "Master Informatique",
            "degreeEn": "MSc Computer Science",
            "school": "University",
            "period": "2018 — 2020",
            "link": "https://example.edu",
            "sortOrder": 1,
        },
        expect=201,
        name="POST /education",
    )
    CTX.ids["education"] = id_of(edu)
    req("GET", "/api/v1/education", expect=200, name="GET /education")
    req("PUT", f"/api/v1/education/{CTX.ids['education']}", auth=True, body={"school": "Tech University"}, expect=200, name="PUT /education/:id")

    # ---------- Certifications ----------
    cert = req(
        "POST",
        "/api/v1/certifications",
        auth=True,
        body={"name": "AWS SAA", "issuer": "Amazon", "year": "2024", "link": "https://aws.amazon.com", "sortOrder": 1},
        expect=201,
        name="POST /certifications",
    )
    CTX.ids["certification"] = id_of(cert)
    req("GET", "/api/v1/certifications", expect=200, name="GET /certifications")
    req("PUT", f"/api/v1/certifications/{CTX.ids['certification']}", auth=True, body={"year": "2025"}, expect=200, name="PUT /certifications/:id")

    # ---------- Achievements ----------
    ach = req(
        "POST",
        "/api/v1/achievements",
        auth=True,
        body={"iconKey": "bolt", "value": "99.9%", "labelFr": "Uptime", "labelEn": "Uptime", "sortOrder": 1},
        expect=201,
        name="POST /achievements",
    )
    CTX.ids["achievement"] = id_of(ach)
    req("GET", "/api/v1/achievements", expect=200, name="GET /achievements")
    req("PUT", f"/api/v1/achievements/{CTX.ids['achievement']}", auth=True, body={"value": "99.99%"}, expect=200, name="PUT /achievements/:id")

    # ---------- Languages ----------
    lang = req(
        "POST",
        "/api/v1/languages",
        auth=True,
        body={"language": "French", "proficiencyFr": "Natif", "proficiencyEn": "Native", "sortOrder": 1},
        expect=201,
        name="POST /languages",
    )
    CTX.ids["language"] = id_of(lang)
    req("GET", "/api/v1/languages", expect=200, name="GET /languages")
    req("PUT", f"/api/v1/languages/{CTX.ids['language']}", auth=True, body={"proficiencyEn": "Native speaker"}, expect=200, name="PUT /languages/:id")

    # ---------- References (auth required for read) ----------
    ref = req(
        "POST",
        "/api/v1/references",
        auth=True,
        body={
            "name": "Jane Doe",
            "roleFr": "CEO",
            "roleEn": "CEO",
            "company": "Acme",
            "email": "jane@acme.test",
            "phone": "+10000000000",
            "sortOrder": 1,
        },
        expect=201,
        name="POST /references",
    )
    CTX.ids["reference"] = id_of(ref)
    req("GET", "/api/v1/references", expect={401, 403}, name="GET /references without auth (must fail)", auth=False)
    # refresh csrf after unauth call? cookies still ok
    req("GET", "/api/v1/references", auth=True, expect=200, name="GET /references (admin)")
    req("PUT", f"/api/v1/references/{CTX.ids['reference']}", auth=True, body={"company": "Acme Corp"}, expect=200, name="PUT /references/:id")

    # ---------- Projects ----------
    project = req(
        "POST",
        "/api/v1/projects",
        auth=True,
        body={
            "titleFr": "Portfolio API",
            "titleEn": "Portfolio API",
            "descriptionFr": "Backend CMS",
            "descriptionEn": "Backend CMS",
            "problemFr": "Contenu mocké",
            "problemEn": "Mocked content",
            "solutionFr": ["API REST modulaire"],
            "solutionEn": ["Modular REST API"],
            "impactFr": ["Admin CMS"],
            "impactEn": ["Admin CMS"],
            "techStack": {"frontend": ["React"], "backend": ["Express", "Prisma"]},
            "images": ["https://cdn.example.com/p1.png"],
            "preview": "https://cdn.example.com/preview.png",
            "category": "Backend",
            "status": "Production",
            "complexity": "Avancé",
            "role": "Full Stack Developer",
            "duration": "2 months",
            "date": "2026-09",
            "isPublished": True,
            "isFeatured": True,
            "confidential": False,
            "github": "https://github.com/barthez-kenwou/backend-barthez-portfolio",
        },
        expect=201,
        name="POST /projects",
    )
    CTX.ids["project"] = id_of(project)
    req("GET", "/api/v1/projects", expect=200, name="GET /projects (public published)")
    req("GET", f"/api/v1/projects/{CTX.ids['project']}", expect=200, name="GET /projects/:id")
    req(
        "PUT",
        f"/api/v1/projects/{CTX.ids['project']}",
        auth=True,
        body={"isFeatured": True, "descriptionEn": "Updated CMS"},
        expect=200,
        name="PUT /projects/:id",
    )
    req("GET", "/api/v1/projects?includeUnpublished=true", auth=True, expect=200, name="GET /projects?includeUnpublished=true")

    # ---------- Blogs ----------
    blog = req(
        "POST",
        "/api/v1/blogs",
        auth=True,
        body={
            "titleFr": "Bonjour portfolio",
            "titleEn": "Hello portfolio",
            "excerptFr": "Intro FR",
            "excerptEn": "Intro EN",
            "contentFr": "# Contenu markdown du blog portfolio",
            "contentEn": "# Portfolio blog markdown content",
            "image": "https://cdn.example.com/blog.png",
            "category": "Engineering",
            "date": "2026-09-08T10:00:00.000Z",
            "readTime": "5 min",
            "author": "Barthez Kenwou",
            "tags": ["backend", "portfolio"],
            "isPublished": True,
        },
        expect={200, 201},
        name="POST /blogs",
    )
    CTX.ids["blog"] = id_of(blog)
    slug = (blog.get("data") or {}).get("slug") or ""
    req("GET", "/api/v1/blogs", expect=200, name="GET /blogs (public)")
    if CTX.ids.get("blog"):
        req(
            "PATCH",
            f"/api/v1/blogs/{CTX.ids['blog']}/publish",
            auth=True,
            expect={200, 404},
            name="PATCH /blogs/:id/publish",
        )
    if slug:
        req("GET", f"/api/v1/blogs/{slug}", expect=200, name=f"GET /blogs/{slug}")
    if CTX.ids.get("blog"):
        req(
            "PUT",
            f"/api/v1/blogs/{CTX.ids['blog']}",
            auth=True,
            body={"excerptEn": "Updated intro"},
            expect=200,
            name="PUT /blogs/:id",
        )

    # ---------- Testimonials ----------
    # public feedback
    refresh_csrf()
    fb = req(
        "POST",
        "/api/v1/testimonials/feedback",
        body={
            "rating": 5,
            "textFr": "Super collaboration",
            "textEn": "Great collaboration",
            "nameFr": "Client",
            "nameEn": "Client",
            "roleFr": "CTO",
            "roleEn": "CTO",
            "company": "Startup",
            "email": "client@startup.test",
        },
        expect={200, 201},
        name="POST /testimonials/feedback (public)",
        auth=False,
    )
    CTX.ids["testimonial_public"] = id_of(fb)
    # admin create
    refresh_csrf()
    tm = req(
        "POST",
        "/api/v1/testimonials",
        auth=True,
        body={
            "rating": 5,
            "textFr": "Excellent",
            "textEn": "Excellent",
            "nameFr": "Alice",
            "nameEn": "Alice",
            "roleFr": "PM",
            "roleEn": "PM",
            "isPublished": False,
            "status": "pending",
        },
        expect=201,
        name="POST /testimonials (admin)",
    )
    CTX.ids["testimonial"] = id_of(tm)
    req("GET", "/api/v1/testimonials", expect=200, name="GET /testimonials (public filter)")
    if CTX.ids.get("testimonial"):
        req("PATCH", f"/api/v1/testimonials/{CTX.ids['testimonial']}/approve", auth=True, expect=200, name="PATCH /testimonials/:id/approve")
        req("GET", f"/api/v1/testimonials/{CTX.ids['testimonial']}", auth=True, expect=200, name="GET /testimonials/:id (admin)")

    # ---------- Contact responses ----------
    refresh_csrf()
    cr = req(
        "POST",
        "/api/v1/contact-responses",
        body={
            "name": "Visitor",
            "email": "visitor@example.com",
            "subject": "Hello there portfolio",
            "message": "I would like to discuss a project opportunity with you.",
        },
        expect={200, 201},
        name="POST /contact-responses (public form)",
        auth=False,
    )
    CTX.ids["contact_response"] = id_of(cr)
    refresh_csrf()
    req("GET", "/api/v1/contact-responses", auth=True, expect=200, name="GET /contact-responses (admin)")
    if CTX.ids.get("contact_response"):
        req("GET", f"/api/v1/contact-responses/{CTX.ids['contact_response']}", auth=True, expect=200, name="GET /contact-responses/:id (auto-read)")
        req(
            "PATCH",
            f"/api/v1/contact-responses/{CTX.ids['contact_response']}",
            auth=True,
            body={"status": "replied", "notes": "Answered via email"},
            expect={200, 404},
            name="PATCH /contact-responses/:id",
        )
        # some modules use PUT
        req(
            "PUT",
            f"/api/v1/contact-responses/{CTX.ids['contact_response']}",
            auth=True,
            body={"status": "archived", "notes": "Done"},
            expect={200, 404},
            name="PUT /contact-responses/:id (alt)",
        )

    # ---------- CV + Dashboard ----------
    req("GET", "/api/v1/cv", expect=200, name="GET /cv (aggregate)")
    req("GET", "/api/v1/admin/dashboard", auth=True, expect=200, name="GET /admin/dashboard")

    # ---------- Security checks ----------
    req("POST", "/api/v1/skills", body={"name": "x", "category": "y", "level": 1, "icon": "z"}, expect={401, 403}, name="POST /skills without auth (must fail)", auth=False)
    refresh_csrf()
    req("DELETE", f"/api/v1/skills/{CTX.ids.get('skill','000000000000000000000000')}", expect={401, 403}, name="DELETE /skills without auth (must fail)", auth=False)

    # ---------- Soft deletes (admin) ----------
    refresh_csrf()
    for key, base in [
        ("skill", "skills"),
        ("service", "services"),
        ("experience", "experiences"),
        ("education", "education"),
        ("certification", "certifications"),
        ("achievement", "achievements"),
        ("language", "languages"),
        ("reference", "references"),
        ("project", "projects"),
        ("blog", "blogs"),
        ("testimonial", "testimonials"),
        ("contact_response", "contact-responses"),
    ]:
        _id = CTX.ids.get(key)
        if _id:
            req("DELETE", f"/api/v1/{base}/{_id}", auth=True, expect={200, 204}, name=f"DELETE /{base}/:id")

    # Summary
    passed = sum(1 for r in RESULTS if r["ok"])
    failed = [r for r in RESULTS if not r["ok"]]
    print("\n=== SUMMARY ===")
    print(f"Passed: {passed}/{len(RESULTS)}")
    if failed:
        print("Failures:")
        for r in failed:
            print(f"  - {r['name']} status={r['status']} expect={r['expect']} {r['error']}")
    out = Path("/tmp/portfolio-route-results.json")
    out.write_text(json.dumps({"passed": passed, "total": len(RESULTS), "results": RESULTS}, indent=2))
    print(f"Report: {out}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
