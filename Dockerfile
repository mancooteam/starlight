# Usamos una imagen oficial de PHP con Apache
FROM php:8.2-apache

# Instalamos las extensiones necesarias para conectar a la Base de Datos
RUN docker-php-ext-install pdo pdo_mysql

# Copiamos todos tus archivos (html, js, php) al servidor
COPY . /var/www/html/

# Le decimos a Apache que acepte conexiones en el puerto que Render nos asigne
# Render usa la variable PORT, Apache suele usar 80. Esto lo ajusta.
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Configuramos permisos correctos
RUN chown -R www-data:www-data /var/www/html