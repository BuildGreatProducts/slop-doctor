# Slop Doctor

> Lightweight product summary written from the founder's brief (23 Sep 2026). There was no ProductOS Define phase for this side project; sections the brief didn't cover are marked "Not defined".

## Summary

Slop Doctor is a one-page, tongue-in-cheek web app that checks a website's landing page for AI slop. Paste a URL and "the doctor can see you now": the app photographs the page, examines it, and TypeSafe's Jev model diagnoses the design for the tells of AI-generated, template-default design. You watch a scanner sweep your screenshot and circle each symptom, then you get a chart with a Slop Index, a diagnosis and prescriptions.

## Customer

People who build and ship websites with AI tools (v0, Lovable, Bolt, Framer AI, Cursor, Claude Code) and want to know whether their landing page looks like everyone else's. Also designers who enjoy pointing at slop.

## Problem

AI tools default to the statistically common choice: purple gradients, Inter, centred heroes with a pill badge, three identical icon cards. Landing pages built this way look interchangeable, and their makers often can't see it.

## Mechanism

1. Firecrawl captures a full-page screenshot plus the page's HTML, copy and branding (fonts, colours).
2. Code runs "lab tests" on the text: em-dash rate, buzzwords, placeholder copy, default fonts, generator fingerprints.
3. A cheap vision model (Gemini Flash-Lite) describes each region of the screenshot, with bounding boxes, without judging it.
4. Jev (TypeSafe's System One model) answers typed yes/no, choice and score questions about each region and the whole page.
5. Code combines Jev's probabilities into a Slop Index, a diagnosis tier and pre-written prescriptions.

## Why

It's funny, it's fast, and it's specific: symptoms are drawn on your own screenshot rather than handed over as generic advice. Slop Doctor's own design follows a strict anti-slop design system, so the product demonstrates the cure.

## Business model

Free. No payments. Sign-in is required to run an examination so costs stay bounded (10 examinations per account per day).

## Proof

Not defined.

## Goal

Not defined beyond shipping the app. A useful signal is people sharing their charts.
