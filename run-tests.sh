#!/usr/bin/env bash
# en cas d'erreur d'une commande, le script s'arrêt et retourne le code d'erreur de la commande
set -euo pipefail

TESTS_RESULTS_DIR=./test-results
# Nettoyer les résultats précédents
rm -rf "$TESTS_RESULTS_DIR"
mkdir -p "$TESTS_RESULTS_DIR"
# Installer les dépendances
npm ci
# lancer les tests (retourne un code de sortie d'erreur si les tests échouent)
export JEST_JUNIT_OUTPUT_DIR="$TESTS_RESULTS_DIR"
npm run test:ci