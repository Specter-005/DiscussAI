# 🎬 Movie Recommendation System

An AI-powered Movie Recommendation System that suggests movies based on user preferences and mood. The project combines a machine learning mood classifier with a responsive web interface and a Python backend to deliver personalized movie recommendations.

---

## 🚀 Features

- 🎭 Mood-based movie recommendations
- 🤖 AI-powered mood classification model
- 🌐 Interactive web interface
- 📚 Built-in movie database
- ⚡ Fast backend using Python
- 🐳 Docker support for easy deployment
- 🧠 Model optimization support using ONNX and TensorRT
- 📦 Triton Inference Server configuration

---

## 📂 Project Structure

```text
Movie recommandation/
├── backend/
│   └── main.py
├── data/
│   ├── expand_db.py
│   └── movies_builtin.json
├── frontend/
│   ├── css/
│   ├── js/
│   └── index.html
├── models/
│   ├── mood_classifier/
│   │   ├── train.py
│   │   └── export_onnx.py
│   └── optimize_tensorrt.py
├── triton_models/
│   ├── ensemble_pipeline/
│   ├── mood_classifier/
│   └── text_embedder/
├── Dockerfile.backend
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## 🛠️ Technologies Used

- Python
- HTML5
- CSS3
- JavaScript
- Machine Learning
- ONNX
- NVIDIA TensorRT
- Triton Inference Server
- Docker

---

## 📋 Prerequisites

- Python 3.10+
- pip
- Docker (Optional)
- Git

---

## ⚙️ Installation

### Clone the repository

```bash
git clone https://github.com/your-username/movie-recommendation.git
cd "Movie recommandation"
```

### Install dependencies

```bash
pip install -r requirements.txt
```

---

## ▶️ Run the Backend

```bash
cd backend
python main.py
```

---

## 🌐 Run the Frontend

Open

```
frontend/index.html
```

in your browser.

---

## 🐳 Run with Docker

Build and start the project:

```bash
docker-compose up --build
```

---

## 🧠 Model Training

Train the mood classifier:

```bash
python models/mood_classifier/train.py
```

Export the trained model to ONNX:

```bash
python models/mood_classifier/export_onnx.py
```

Optimize using TensorRT:

```bash
python models/optimize_tensorrt.py
```

---

## 📊 Dataset

The project includes a built-in movie dataset:

```
data/movies_builtin.json
```

Additional movies can be added using:

```
data/expand_db.py
```

---

## 🎯 Future Enhancements

- User authentication
- Collaborative filtering
- Content-based recommendation
- Deep learning recommendation engine
- Movie posters and trailers
- Ratings and reviews
- Watchlist functionality
- Cloud deployment

---

## 👨‍💻 Author

**Batman**

Computer Science Engineering Student

Interested in Artificial Intelligence, Machine Learning, Full Stack Development, and Recommendation Systems.

---

## 📜 License

This project is developed for educational and learning purposes. Feel free to use and modify it for personal or academic projects.

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.
