## ADDED Requirements

### Requirement: Custom login theme is deployed and bound
The system SHALL provide a Keycloak login theme named `aiplatform` that is mounted into the Keycloak container and configured as the login theme for the `aiplatform` realm.

#### Scenario: Theme available after compose start
- **WHEN** Keycloak is started with the project Docker Compose configuration
- **THEN** the `aiplatform` login theme is available to Keycloak and the `aiplatform` realm uses it for browser login flows

### Requirement: Split-panel neural visual layout
The login theme SHALL render a desktop split layout with a left brand panel (neural-network style background and bilingual brand title) and a right authentication form panel; on narrow viewports the brand panel MUST stack above the form.

#### Scenario: Desktop login layout
- **WHEN** a user opens the login page on a desktop-width viewport
- **THEN** the brand panel appears on the left and the sign-in form on the right with the neural glow visual treatment

#### Scenario: Mobile login layout
- **WHEN** a user opens the login page on a narrow viewport
- **THEN** the brand content appears above the form in a single column

### Requirement: Chinese-primary bilingual copy
Authentication UI text covered by this theme SHALL present Chinese as the primary label and English as secondary supporting text, without requiring the user to switch language.

#### Scenario: Login form labels
- **WHEN** the login page is displayed
- **THEN** fields and primary actions show Chinese primary text with English secondary text (e.g. 用户名或邮箱 / Username or email, 登录 · Sign In)

#### Scenario: Brand title
- **WHEN** the login page is displayed
- **THEN** the brand shows `企业级 AI 智造平台` as primary and `Enterprise AI Manufacturing Platform` as secondary

### Requirement: Reset password and error pages share theme
The theme SHALL style the forgot-password / reset-password flow and error pages with the same visual language and bilingual copy pattern as the login page.

#### Scenario: Forgot password page
- **WHEN** a user opens the reset password page from the login flow
- **THEN** the page uses the `aiplatform` theme styling and bilingual Chinese-primary copy

#### Scenario: Error page
- **WHEN** an authentication error page is shown
- **THEN** the page uses the `aiplatform` theme styling and bilingual messaging where message keys are overridden

### Requirement: Motion respects accessibility preference
Decorative neural-network animation SHALL be disabled or reduced when the user agent indicates `prefers-reduced-motion: reduce`.

#### Scenario: Reduced motion
- **WHEN** the user has reduced-motion preference enabled
- **THEN** the theme does not play continuous decorative animation on the brand panel
