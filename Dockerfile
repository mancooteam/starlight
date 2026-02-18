# Używamy oficjalnego obrazu PHP z serwerem Apache
FROM php:8.2-apache

# Instalujemy rozszerzenie PDO MySQL niezbędne do komunikacji z bazą
RUN docker-php-ext-install pdo pdo_mysql

# Włączamy mod_rewrite dla Apache (przydatne przy linkach)
RUN a2enmod rewrite

# Kopiujemy kod źródłowy do obrazu
COPY . /var/www/html/

# Ustawiamy uprawnienia, aby Apache mógł czytać pliki
RUN chown -R www-data:www-data /var/www/html/

# Port 80 dla ruchu WWW
EXPOSE 80