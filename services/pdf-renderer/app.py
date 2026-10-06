"""
LIT PDF renderer service.

A thin FastAPI wrapper around the founder-supplied ReportLab generator in
./generator. It fills an approved blank master from a JSON data model (a
`common` block plus per-document blocks keyed "01".."07") and returns the PDF.

Authentication is HTTP Basic, from PDF_RENDERER_USERNAME / PDF_RENDERER_PASSWORD.
The service renders only; it never stores anything and has no database access.
"""
import os
import secrets
import tempfile

from fastapi import FastAPI, HTTPException, Depends, Response
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel

# The generator lives alongside this file; make it importable.
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "generator"))

from build_templates import DOCS, set_fill, Doc  # noqa: E402

app = FastAPI(title="LIT PDF Renderer", docs_url=None, redoc_url=None, openapi_url=None)
security = HTTPBasic()

_USER = os.environ.get("PDF_RENDERER_USERNAME", "")
_PASS = os.environ.get("PDF_RENDERER_PASSWORD", "")

# number -> (filename, n, short, ref, func)
_BY_NUMBER = {n: (fn, n, short, ref, f) for (fn, n, short, ref, f) in DOCS}


def _auth(creds: HTTPBasicCredentials = Depends(security)) -> None:
    if not _USER or not _PASS:
        raise HTTPException(status_code=503, detail="Renderer auth not configured")
    ok_user = secrets.compare_digest(creds.username, _USER)
    ok_pass = secrets.compare_digest(creds.password, _PASS)
    if not (ok_user and ok_pass):
        raise HTTPException(status_code=401, detail="Unauthorized")


class RenderRequest(BaseModel):
    doc: str  # "01".."07"
    data: dict = {}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "documents": sorted(_BY_NUMBER.keys())}


@app.post("/render")
def render(req: RenderRequest, _: None = Depends(_auth)) -> Response:
    try:
        number = int(req.doc)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="doc must be '01'..'07'")
    entry = _BY_NUMBER.get(number)
    if not entry:
        raise HTTPException(status_code=400, detail="unknown document number")

    fn, n, short, ref, func = entry
    common = req.data.get("common", {}) if isinstance(req.data, dict) else {}
    block = req.data.get(f"{n:02d}", {}) if isinstance(req.data, dict) else {}
    set_fill({**common, **block})

    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, f"{n:02d}.pdf")
        d = Doc(out, n, short, ref, version="1.0" if n == 3 else "[Version]")
        d.build(func)
        with open(out, "rb") as fh:
            pdf = fh.read()

    headers = {"Content-Disposition": f'inline; filename="LIT-{n:02d}.pdf"'}
    return Response(content=pdf, media_type="application/pdf", headers=headers)
