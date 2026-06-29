"""Unit tests for order notification email (SMTP mocked — no real emails sent)."""
from __future__ import annotations

import asyncio
from unittest.mock import MagicMock, patch

import pytest

from email_service import (
    SAMPLE_TEST_ORDER,
    _build_order_email,
    _smtp_config,
    log_smtp_config_status,
    send_order_notification,
    send_test_order_email,
)


class TestBuildOrderEmail:
    def test_includes_required_fields(self):
        subject, body, html = _build_order_email(SAMPLE_TEST_ORDER)
        assert "DA-TEST-001" in subject
        assert "Test Customer" in body
        assert "9876543210" in body
        assert "Athwa Lines" in body
        assert "1 Vajra" in body
        assert "Quantity: 1" in body
        assert "₹1,098" in body
        assert "Cash on Delivery" in body
        assert "DA-TEST-001" in html
        assert "Test Customer" in html


class TestSmtpConfig:
    def test_strips_spaces_from_app_password(self, monkeypatch):
        monkeypatch.setenv("SMTP_PASSWORD", "abcd efgh ijkl mnop")
        monkeypatch.setenv("SMTP_USER", "sender@example.com")
        cfg = _smtp_config()
        assert cfg["password"] == "abcdefghijklmnop"

    def test_defaults_notify_email(self, monkeypatch):
        monkeypatch.delenv("ORDER_NOTIFY_EMAIL", raising=False)
        cfg = _smtp_config()
        assert cfg["notify_email"] == "dharmarajayurveda@gmail.com"


class TestSendOrderNotification:
    def test_send_success(self, monkeypatch):
        monkeypatch.setenv("SMTP_USER", "sender@example.com")
        monkeypatch.setenv("SMTP_PASSWORD", "secret")
        monkeypatch.setenv("ORDER_NOTIFY_EMAIL", "notify@example.com")

        mock_smtp = MagicMock()
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        with patch("email_service.smtplib.SMTP", mock_smtp):
            sent = asyncio.run(send_order_notification(SAMPLE_TEST_ORDER))

        assert sent is True
        mock_smtp.assert_called_once()
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("sender@example.com", "secret")
        mock_server.sendmail.assert_called_once()

    def test_skips_when_not_configured(self, monkeypatch):
        monkeypatch.delenv("SMTP_USER", raising=False)
        monkeypatch.delenv("SMTP_PASSWORD", raising=False)
        sent = asyncio.run(send_order_notification(SAMPLE_TEST_ORDER))
        assert sent is False

    def test_test_email_prefixes_subject(self, monkeypatch):
        monkeypatch.setenv("SMTP_USER", "sender@example.com")
        monkeypatch.setenv("SMTP_PASSWORD", "secret")
        monkeypatch.setenv("ORDER_NOTIFY_EMAIL", "notify@example.com")

        captured: dict = {}

        def fake_send(subject, _text, _html):
            captured["subject"] = subject
            return True

        with patch("email_service._send_smtp", side_effect=fake_send):
            sent = asyncio.run(send_test_order_email())

        assert sent is True
        assert captured["subject"].startswith("[TEST]")


def test_log_smtp_config_status_does_not_raise(caplog):
    import logging

    with caplog.at_level(logging.INFO):
        log_smtp_config_status()
    assert any("SMTP config" in r.message for r in caplog.records)
