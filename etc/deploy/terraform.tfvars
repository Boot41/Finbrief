# Google Cloud Project Configuration
project_id = "boot41"
region     = "asia-south1"

# Container Deployment Configuration
service_name    = "finbrief1"
container_image = "asia-south1-docker.pkg.dev/boot41/a3/finbrief1"
container_tag   = "one"

# Environment Variables (Optional)
environment_variables = {
"MONGO_URI"="mongodb+srv://tusharbisht:12345@cluster0.jawmi.mongodb.net/finbrief3",
"JWT_SECRET"="mysecretkey",
"GOOGLE_API_KEY"="AIzaSyCAB6UX4aF51jL_njugbGOKg-xoK65B9S0",
"GOOGLE_CLIENT_ID"="445489948580-stuovmdbh31nbv2utuhmn66eudj5tudj.apps.googleusercontent.com",
"GROQ_API_KEY"="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"
}
