# Google Cloud Project Configuration
project_id = "boot41"
region     = "asia-south1"

# Container Deployment Configuration
service_name    = "finbrief6"
container_image = "asia-south1-docker.pkg.dev/boot41/a3/finbrief6"
container_tag   = "latest"

# Environment Variables (Optional)
environment_variables = {
NODE_ENV="production",
MONGO_URI="mongodb+srv://tusharbisht:12345@cluster0.jawmi.mongodb.net/finbrief",
JWT_SECRET="mysecretkey",
GOOGLE_API_KEY="AIzaSyCAB6UX4aF51jL_njugbGOKg-xoK65B9S0",
GOOGLE_CLIENT_ID="445489948580-stuovmdbh31nbv2utuhmn66eudj5tudj.apps.googleusercontent.com",
GROQ_API_KEY="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"
}
