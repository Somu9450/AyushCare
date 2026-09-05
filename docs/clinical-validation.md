# Clinical Validation Guide

## What This Suite Validates

`app/services/clinical_safety_suite.py` and `tests/test_safety_suite.py` contain synthetic regression scenarios. Each scenario checks:

- The expected adaptive question progression occurs under SOCRATES guidelines;
- Required urgent and emergency red-flag rules trigger properly (e.g., stroke, chest pain, suicidal ideation);
- Unsafe outputs such as prescriptive diagnosis or medical advice are blocked;
- AYUSH Dashavidha Pariksha parameters are collected faithfully without artificial Prakriti inference;
- Multilingual inputs (Hindi, Telugu, Tamil, Marathi, English) are handled accurately.

These synthetic scenarios contain no real patient data.

---

## Required Clinical Sign-Off Process

1. **Allopathic Lead**: Reviews general clinical question flows, red-flag triggers, and abnormal lab reference ranges.
2. **AYUSH Lead**: Reviews Dashavidha Pariksha and Ahara-Vihara wording, translation fidelity, and physician summary layouts.
3. **Safety Gate**: Run the clinical safety suite on every model or prompt change:
   ```powershell
   pytest tests/test_safety_suite.py -v
   ```
4. **Zero-Tolerance Release Policy**: Any missed urgent or emergency scenario blocks release.

---

## Running the Tests

```powershell
# Run all clinical safety and domain validation tests
pytest tests/test_safety_suite.py tests/test_red_flags.py tests/test_document_intelligence.py -v
```
