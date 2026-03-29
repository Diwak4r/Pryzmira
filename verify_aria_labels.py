import os
from playwright.sync_api import sync_playwright

def verify_aria_labels():
    screenshot_dir = '/home/jules/verification/screenshots'
    os.makedirs(screenshot_dir, exist_ok=True)

    with sync_playwright() as p:
        # NOTE: Need to grant clipboard permissions for navigator.clipboard.writeText to work
        # without failing or prompting when running headlessly
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            permissions=['clipboard-read', 'clipboard-write']
        )
        page = context.new_page()

        print("\nTesting Waitlist modal by clicking the button...")
        page.goto('http://localhost:3000/')
        page.wait_for_load_state('networkidle')

        try:
            # Look for button that opens waitlist:
            join_btn = page.locator('button:has-text("Join Pro Waitlist")')
            join_btn.wait_for(state='visible', timeout=10000)
            join_btn.click()
            print("Clicked Join Pro Waitlist!")

            page.screenshot(path=os.path.join(screenshot_dir, 'waitlist_modal_open.png'))

            # Type in waitlist email
            email_input = page.locator('#waitlist-email')
            email_input.wait_for(state='visible', timeout=5000)
            email_input.fill('test2@example.com')

            # Find the submit button for Waitlist
            join_submit_btn = page.locator('button[type="submit"]:has-text("Join Waitlist")')
            join_submit_btn.wait_for(state='visible', timeout=5000)
            join_submit_btn.click()

            copy_button = page.locator('button[aria-label="Copy referral link"]')
            copy_button.wait_for(state='visible', timeout=10000)
            print("Found 'Copy referral link' button!")
            copy_button.evaluate("el => el.style.border = '2px solid green'")
            page.screenshot(path=os.path.join(screenshot_dir, 'waitlist_copy_button.png'))
            print("Captured waitlist_copy_button.png")

            copy_button.click()
            page.wait_for_timeout(1000)
            copied_label = page.locator('button[aria-label="Copied referral link"]')
            copied_label.wait_for(state='visible', timeout=5000)
            print("Found 'Copied referral link' button after click!")
            copied_label.evaluate("el => el.style.border = '2px solid orange'")
            page.screenshot(path=os.path.join(screenshot_dir, 'waitlist_copy_button_clicked.png'))
            print("Captured waitlist_copy_button_clicked.png")

        except Exception as e:
            print("Failed on waitlist page:")
            print(e)
            page.screenshot(path=os.path.join(screenshot_dir, 'waitlist_failed.png'))

        browser.close()
        print("Done!")

if __name__ == "__main__":
    verify_aria_labels()
