#!/bin/bash
echo "Генерация SSL сертификата для PathFinder..."
echo ""

# Переход в папку проекта
cd "$(dirname "$0")"

# Создание папки если нет
mkdir -p src/main/resources/ssl

# Удаление старого сертификата если есть
rm -f src/main/resources/ssl/keystore.p12

# Генерация нового сертификата
keytool -genkeypair \
  -alias pathfinder \
  -keyalg RSA \
  -keysize 2048 \
  -storetype PKCS12 \
  -keystore src/main/resources/ssl/keystore.p12 \
  -validity 3650 \
  -storepass changeit \
  -keypass changeit \
  -dname "CN=localhost, OU=PathFinder, O=PathFinder, L=Novosibirsk, ST=NSK, C=RU" \
  2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ SSL сертификат успешно создан!"
    echo "📍 Расположение: src/main/resources/ssl/keystore.p12"
    echo "🔑 Пароль: changeit"
    echo ""
    echo "Запустите приложение:"
    echo "./gradlew bootRun"
    echo ""
    echo "Откройте в браузере:"
    echo "👉 https://localhost:8443/map"
    echo ""
    echo "Браузер предупредит о самоподписанном сертификате - это нормально для разработки."
else
    echo "❌ Ошибка при создании сертификата!"
    echo "Попробуйте установить Java или используйте OpenSSL:"
    echo ""
    echo "sudo apt install openjdk-21-jre-headless"
fi