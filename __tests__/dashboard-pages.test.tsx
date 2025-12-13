import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MessagesPage from "../app/[lang]/dashboard/messages/page";
import NotificationsPage from "../app/[lang]/dashboard/notifications/page";
import ProfilePage from "../app/[lang]/dashboard/profile/page";
import SettingsPage from "../app/[lang]/dashboard/settings/page";
import FilesPage from "../app/[lang]/dashboard/files/page";
import LessonsPage from "../app/[lang]/dashboard/lessons/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      image: "https://example.com/avatar.jpg",
    },
  }),
}));

// Mock dictionary
vi.mock("@/lib/get-dictionary", () => ({
  getDictionary: vi.fn().mockResolvedValue({
    auth: {
      register: {
        first_name: "First Name",
        last_name: "Last Name",
        username: "Username",
      },
    },
    common: {
      edit: "Edit",
      cancel: "Cancel",
      save: "Save",
      error: "Error",
      success: "Success",
      delete: "Delete",
      confirm: "Confirm",
    },
    dashboard: {
      nav: {
        overview: "Overview",
        lessons: "Lessons",
        schedule: "Schedule",
        messages: "Messages",
        files: "Files",
        finance: "Finance",
        settings: "Settings",
        profile: "Profile",
        notifications: "Notifications",
        logout: "Logout",
        menu_title: "Menu",
        menu_desc: "Main navigation",
      },
      messages: {
        title: "Messages",
        search_placeholder: "Search messages...",
        type_message: "Type a message...",
        send: "Send",
        online: "Online",
        offline: "Offline",
        mock_user_name: "Alice Smith",
        mock_user_name_2: "Bob Johnson",
        mock_msg_3: "See you tomorrow!",
        mock_msg_4: "Can we reschedule?",
        mock_time_3: "10:30 AM",
        mock_time_4: "Yesterday",
        mock_user_initial: "A",
      },
      notifications: {
        title: "Notifications",
        mark_all_read: "Mark all as read",
        no_notifications: "No notifications",
        all: "All",
        unread: "Unread",
        system: "System",
        no_unread: "No unread notifications",
        no_system: "No system notifications",
        mock_title_1: "System Update",
        mock_msg_1: "Deniko has been updated to version 2.0",
        mock_time_1: "2 hours ago",
        mock_title_2: "Lesson Reminder",
        mock_msg_2: "You have a lesson with Alice in 1 hour",
        mock_time_2: "3 hours ago",
        mock_title_3: "Payment Received",
        mock_msg_3: "Payment of $50 received from Bob",
        mock_time_3: "1 day ago",
        types: {
          lesson: "Lesson",
          system: "System",
          payment: "Payment",
          message: "Message",
        },
      },
      profile: {
        title: "Profile",
        personal_info: "Personal Information",
        personal_info_desc: "Update your personal details here.",
        contact_info: "Contact Information",
        contact_info_desc: "How can we reach you?",
        save_changes: "Save Changes",
        change_avatar: "Change Avatar",
        full_name: "Full Name",
        email: "Email",
        role: "Role",
        phone: "Phone Number",
        phone_placeholder: "+1 234 567 890",
        address: "Address",
        address_placeholder: "123 Main St",
        activity_stats: {
          title: "Activity & Stats",
          description: "Your platform activity overview",
          lessons: "Lessons Taught",
          students: "Students",
          rating: "Rating",
        },
        settings: {
          username: {
            title: "Username",
            description: "Your public profile URL",
            label: "Username",
            placeholder: "Enter username",
            button: "Save Changes",
            success: "Username updated successfully",
            error: "Failed to update username",
          },
          basic: {
            title: "Basic Information",
            description: "Update your personal details.",
            firstName: "First Name",
            lastName: "Last Name",
            save: "Save Changes",
            success: "Profile updated successfully",
            saving: "Saving...",
            avatar: {
              label: "Avatar",
              upload: "Upload Photo",
              upload_hint: "JPG, GIF or PNG. Max 5MB.",
              presets: "Choose from presets",
              crop_title: "Crop Avatar",
              crop_desc: "Drag to position and use the slider to zoom.",
              cancel: "Cancel",
              save: "Save",
              error_file_type: "Please upload an image file",
              error_file_size: "File size must be less than 5MB",
              success_update: "Avatar updated successfully",
              error_upload: "Failed to upload avatar",
            },
          },
        },
      },
      settings: {
        title: "Settings",
        description: "Manage your account settings and preferences.",
        nav: {
          profile: "Profile",
          security: "Security",
          privacy: "Privacy",
          notifications: "Notifications",
          language: "Language",
          cookies: "Cookies",
        },
        account: "Account",
        account_desc: "Manage your account settings.",
        security: "Security",
        privacy: {
          title: "Privacy Settings",
          description: "Manage your privacy settings.",
          profileVisibility: {
            label: "Profile Visibility",
            public: "Public",
            private: "Private",
          },
          showAvatar: { label: "Show Avatar" },
          showEmail: { label: "Show Email" },
          showPhone: { label: "Show Phone" },
          allowMessages: { label: "Allow Messages" },
          showCourses: { label: "Show Courses" },
          save: "Save",
          success: "Success",
          saving: "Saving...",
        },
        notifications: {
          title: "Notifications",
          description: "Configure how you receive notifications.",
          email: {
            label: "Email Notifications",
            description: "Receive emails about your account activity.",
          },
          inApp: {
            label: "In-App Notifications",
            description: "Receive notifications within the application.",
          },
          marketing: {
            label: "Marketing Emails",
            description: "Receive emails about new features and offers.",
          },
          save: "Save Preferences",
          success: "Notification preferences updated",
          saving: "Saving...",
        },
        region: {
          title: "Region & Timezone",
          description: "Set your preferred region and timezone.",
          country: { label: "Country", placeholder: "Select a country" },
          timezone: { label: "Timezone", placeholder: "Select a timezone" },
          save: "Save Preferences",
          success: "Region settings updated",
          saving: "Saving...",
        },
        language: "Language",
        language_desc: "Select your preferred language.",
        theme: "Theme",
        two_fa_label: "Two-Factor Authentication",
        two_fa_desc: "Add an extra layer of security to your account.",
        delete_account_label: "Delete Account",
        delete_account_desc: "Permanently remove your account and all data.",
        delete_account_button: "Delete Account",
        email_notifications_label: "Email Notifications",
        email_notifications_desc: "Receive emails about your account activity.",
        marketing_emails_label: "Marketing Emails",
        marketing_emails_desc: "Receive emails about new features and offers.",
        language_placeholder: "Select Language",
        en: "English",
        tr: "Türkçe",
      },
      files: {
        title: "Files",
        upload: "Upload File",
        drag_drop: "Drag and drop files here",
        no_files: "No files uploaded yet",
        download: "Download",
        delete: "Delete",
      },
      lessons: {
        title: "Lessons",
        schedule_lesson: "Schedule Lesson",
        at: "at",
        details: "Details",
      },
    },
    profile: {
      settings: {
        username: {
          title: "Username",
          description: "Change your username",
          label: "Username",
          placeholder: "Enter username",
          button: "Save",
          success: "Username updated",
          error: "Error updating username",
        },
        basic: {
          title: "Basic Information",
          description: "Update your personal details.",
          firstName: "First Name",
          lastName: "Last Name",
          save: "Save Changes",
          success: "Profile updated successfully",
          saving: "Saving...",
          avatar: {
            label: "Avatar",
            upload: "Upload Photo",
            upload_hint: "JPG, GIF or PNG. Max 5MB.",
            presets: "Choose from presets",
            crop_title: "Crop Avatar",
            crop_desc: "Drag to position and use the slider to zoom.",
            cancel: "Cancel",
            save: "Save",
            error_file_type: "Please upload an image file",
            error_file_size: "File size must be less than 5MB",
            success_update: "Avatar updated successfully",
            error_upload: "Failed to upload avatar",
          },
          phone: {
            label: "Phone Number",
            placeholder: "+1 234 567 890",
            countrySelectorLabel: "Country",
            noResultsMessage: "No results",
            searchPlaceholder: "Search",
          },
        },
        security: {
          password: {
            title: "Password",
            description: "Change your password.",
            currentPassword: "Current Password",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            save: "Update Password",
            success: "Password updated successfully",
            security_strength: "Security Strength",
            saving: "Saving...",
            hide_password: "Hide password",
            show_password: "Show password",
            enter_password: "Enter Password",
            weak: "Weak",
            medium: "Medium",
            strong: "Strong",
          },
          email: {
            title: "Email Address",
            description: "Change your email address.",
            currentEmail: "Current Email",
            newEmail: "New Email",
            sendVerification: "Send Verification Email",
            success: "Verification email sent",
            sending: "Sending...",
          },
          phone: {
            title: "Phone Number",
            description: "Update your phone number.",
            label: "Phone Number",
            placeholder: "+90...",
            save: "Update Phone",
            success: "Phone number updated",
          },
        },
        notifications: {
          title: "Notification Preferences",
          description: "Choose what notifications you want to receive.",
          emailNotifications: {
            label: "Email Notifications",
            description: "Receive emails about your account activity.",
          },
          marketingEmails: {
            label: "Marketing Emails",
            description: "Receive emails about new products and features.",
          },
          securityAlerts: {
            label: "Security Alerts",
            description: "Receive emails about security incidents.",
          },
          save: "Save Preferences",
          success: "Notification preferences updated",
          saving: "Saving...",
        },
        region: {
          title: "Region & Language",
          description: "Set your preferred language and region.",
          language: {
            label: "Language",
            placeholder: "Select a language",
          },
          timezone: {
            label: "Timezone",
            placeholder: "Select a timezone",
          },
          save: "Save Region Settings",
          success: "Region settings updated",
          saving: "Saving...",
        },
        cookies: {
          title: "Cookie Settings",
          description: "Manage your cookie preferences.",
          necessary: {
            label: "Necessary Cookies",
            description:
              "These cookies are required for the website to function.",
          },
          analytics: {
            label: "Analytics Cookies",
            description: "These cookies help us improve our website.",
          },
          marketing: {
            label: "Marketing Cookies",
            description: "These cookies are used to show you relevant ads.",
          },
          save: "Save Cookie Settings",
          success: "Cookie settings updated",
          saving: "Saving...",
        },
        danger: {
          deactivate: {
            title: "Deactivate Account",
            description: "Temporarily disable your account.",
            button: "Deactivate Account",
            confirmTitle: "Are you sure?",
            confirmDescription: "This will hide your profile.",
            cancel: "Cancel",
            confirmButton: "Deactivate",
            success: "Account deactivated",
            processing: "Processing...",
          },
          delete: {
            title: "Delete Account",
            description: "Permanently delete your account.",
            button: "Delete Account",
            confirmTitle: "Are you absolutely sure?",
            confirmDescription: "This action cannot be undone.",
            cancel: "Cancel",
            confirmButton: "Delete Account",
            success: "Account deleted",
            typeToConfirm: "Type {keyword} to confirm.",
            deleting: "Deleting...",
          },
        },
        privacy: {
          title: "Privacy Settings",
          description: "Manage who can see your profile and contact you.",
          isProfilePublic: {
            label: "Public Profile",
            description: "Allow others to see your profile.",
          },
          showEmail: {
            label: "Show Email",
          },
          showCourses: {
            label: "Show Courses",
          },
          showAchievements: {
            label: "Show Achievements",
          },
          save: "Save Privacy Settings",
          success: "Privacy settings updated",
          messagingDisabled: "Messaging is disabled for this user.",
          saving: "Saving...",
        },
      },
    },
    validation: {
      min_length: "Minimum length is {length}",
      required: "Required",
      passwords_do_not_match: "Passwords do not match",
    },
  }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        username: "testuser",
        isProfilePublic: true,
        showAvatarOnProfile: true,
        showEmailOnProfile: false,
        showPhoneOnProfile: false,
        allowMessagesFromUsers: true,
      }),
    },
  },
}));

// Mock storage
vi.mock("@/lib/storage", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://example.com/signed-url.jpg"),
  uploadFile: vi
    .fn()
    .mockResolvedValue("https://example.com/uploaded-file.jpg"),
  deleteFile: vi.fn().mockResolvedValue(true),
}));

describe("Dashboard Pages", () => {
  const params = Promise.resolve({ lang: "en" });

  it("renders Messages page", async () => {
    const page = await MessagesPage({ params });
    render(page);
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search messages...")
    ).toBeInTheDocument();
  });

  it("renders Notifications page", async () => {
    const page = await NotificationsPage({ params });
    render(page);
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    // Check for mock data content
    expect(screen.getByText("System Update")).toBeInTheDocument();
  });

  it("renders Profile page", async () => {
    const page = await ProfilePage({ params });
    render(page);
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
  });

  it("renders Settings page", async () => {
    const page = await SettingsPage({ params });
    render(page);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getAllByText("Username").length).toBeGreaterThan(0);
  });

  it("renders Files page", async () => {
    const page = await FilesPage({ params });
    render(page);
    expect(screen.getByText("Files")).toBeInTheDocument();
    expect(screen.getByText("Upload File")).toBeInTheDocument();
  });

  it("renders Lessons page", async () => {
    const page = await LessonsPage({ params });
    render(page);
    expect(screen.getByText("Lessons")).toBeInTheDocument();
    expect(screen.getByText("Schedule Lesson")).toBeInTheDocument();
  });
});
