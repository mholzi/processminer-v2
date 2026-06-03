# Process Specialist Pilot Test Script

Follow this script to verify that the **Process Specialist** is correctly utilizing the native JSON CRUD tools, respecting the centralized system prompt rules, and updating `wiki/processes/cob-003.json` in real time.

---

## 1. Setup Instructions

1. **Verify your Environment Configuration**:
   Ensure `.env.local` contains the following settings:
   ```env
   SESSION_PROVIDER=gemini
   SESSION_MODEL=gemini-3.5-flash
   GEMINI_API_KEY=AIzaSyCgiE8Byy6m2M6mizEivyvk1NLWQE725KE
   ```

2. **Start the Development Server**:
   Run the following command in your terminal:
   ```bash
   npm run dev
   ```

3. **Open the Web Interface**:
   - Go to `http://localhost:3000` (or the port output by the dev server).
   - Log in using username `admin` and password `adminpass123`.

4. **Select the Pilot Process**:
   - In the process switcher, select **Client Onboarding (BizBanking)** (`COB-003`).
   - Click the chat bubble or **AI Assistant** tab.
   - Ensure the active specialist selected is the **Process Specialist** (or type a message mentioning "process steps" or "process specialist").

---

## 2. Interactive Testing Flow

### Step 1: Initialize the Session
* **What you say (as SME)**:
  > "Hello, let's start documenting process steps for Client Onboarding."
* **What to expect**:
  - The Process Specialist loads. Behind the scenes, the backend worker prepends `CORE_SYSTEM_PROMPT.md` and generates the **Document Map** context (representing `cob-003.json`).
  - The assistant should introduce itself as the Process Specialist, summarize the current overview of Client Onboarding, and ask to walk you through the process steps.

---

### Step 2: Elicit and Edit a New Process Step (Y/E/R Loop)
* **What you say (as SME)**:
  > "Let's add a step where the Relationship Manager reviews the application for basic company eligibility before sending it to KYC."
* **What to expect**:
  - The assistant will draft a new `process-step` containing:
    - **Title**: *Application Review* (or similar)
    - **What happens**
    - **Inputs / Outputs**
    - **Why it matters** (RACI owner: Relationship Manager)
  - It will present the **Y/E/R capture options**:
    - `[Y] Yes — Accept the draft.`
    - `[E] Edit — Suggest changes.`
    - `[R] Rewrite — Request a redraft.`

* **What you say (as SME) to test the Edit loop**:
  > "[E] Change the SLA to 2 hours instead of 1 business day."
* **What to expect**:
  - The assistant should apply the change, re-display the updated draft with `SLA: 2 hours`, and ask for a Y/E/R decision again.

---

### Step 3: Write to the Database
* **What you say (as SME)**:
  > "[Y]"
* **What to expect**:
  - The assistant will trigger the `createElement` tool under the hood.
  - You will see a UI progress line: `✏ Creating new element in process-steps …`
  - The backend assigns the next sequential ID (e.g. `PS-COB-014` or similar) and appends the element to `wiki/processes/cob-003.json`.
  - The assistant will confirm the step has been written and present the next prompt.

---

### Step 4: Verify the Database File
1. Open the file `wiki/processes/cob-003.json` in your code editor.
2. Search for the title of the step you just added (e.g., `"Application Review"`).
3. Confirm it has been successfully added to the `"process-steps"` array with the correct fields, sequence number, and `status: "draft"`.

---

## 3. Verification of Provenance Rules (Read-Back)

When the assistant drafts prose that includes details you did not explicitly state, it must perform a **mandatory read-back**:
- For example, if you say: *"The Relationship Manager checks the KYC flag"*, and the AI drafts a detailed verification paragraph referencing database checks, the AI must ask:
  > *"You mentioned checking the KYC flag. I have also proposed [additional details], which you did not explicitly say. Are these correct?"*
- Once you approve, the heading's provenance shifts from `proposed` to `elicited` inside the element's metadata block.
