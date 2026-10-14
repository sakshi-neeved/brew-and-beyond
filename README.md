# Brew & Beyond ☕ — Interactive Café Website

A responsive café website built with HTML, CSS, JavaScript, Python, and Flask. Designed as a hands-on project for learning manual Docker and AWS ECS deployment.

## Features

- Responsive Gen-Z-inspired design with playful motion and bold colors
- Menu category filters and live search
- Add-to-cart interactions, quantity controls, subtotal calculation, and browser persistence
- Reservation form with browser validation and a demo success modal
- Newsletter demo interaction
- Flask `/health` endpoint for a simple deployment health check
- Dockerfile for containerization

> The reservation, newsletter, and checkout features are frontend demos. They do not send bookings, emails, or payments to a real service.

## Run locally on Ubuntu

1. Open this folder in VS Code.
2. In the VS Code terminal, create and activate a virtual environment:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install Flask:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the app:

   ```bash
   python app.py
   ```

5. Open `http://127.0.0.1:5000` in your browser. Check `http://127.0.0.1:5000/health` for the health response.

## Run with Docker

From the project root:

```bash
docker build -t brew-and-beyond .
docker run --name brew-and-beyond -p 5000:5000 brew-and-beyond
```

Open `http://127.0.0.1:5000`. In another terminal, view logs with:

```bash
docker logs brew-and-beyond
```

Stop and remove the container when finished:

```bash
docker stop brew-and-beyond
docker rm brew-and-beyond
```

## Folder structure

```text
brew-and-beyond/
├── app.py
├── requirements.txt
├── Dockerfile
├── .dockerignore
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
```

## Notes

- Product photos and Google Fonts load from external URLs, so an internet connection is needed for those assets.
- Do not add AWS credentials to this repository.
- For a public production site, add server-side validation, a real booking/email backend, security review, and appropriate monitoring.
