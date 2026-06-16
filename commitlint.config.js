// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // บังคับให้มี scope
    'scope-empty': [2, 'never'],

    // จำกัด type ที่ใช้ได้
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'ci']],

    // subject ต้องมี
    'subject-empty': [2, 'never'],

    // ไม่ต้องขึ้นต้นตัวใหญ่
    'subject-case': [0],

    // จำกัดความยาว (ปรับได้)
    'header-max-length': [2, 'always', 72],
  },
}
