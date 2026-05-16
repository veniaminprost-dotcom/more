FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html gallery.html styles.css script.js /usr/share/nginx/html/
COPY images /usr/share/nginx/html/images
COPY video /usr/share/nginx/html/video

EXPOSE 80
