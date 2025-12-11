export interface Dictionary {
  metadata: {
    home: {
      title: string;
      description: string;
      keywords: string[];
    };
    login: {
      title: string;
      description: string;
    };
    register: {
      title: string;
      description: string;
    };
    forgot_password: {
      title: string;
      description: string;
    };
    reset_password: {
      title: string;
      description: string;
    };
    dashboard: {
      title: string;
      student_title: string;
      teacher_title: string;
      description: string;
      welcome_title: string;
      contact_support: string;
    };
    finance: {
      title: string;
      description: string;
      coming_soon: string;
    };
    schedule: {
      title: string;
      description: string;
      coming_soon: string;
    };
    join: {
      title: string;
      description: string;
    };
    onboarding: {
      title: string;
      description: string;
    };
    verify: {
      title: string;
      description: string;
    };
    students: {
      title: string;
      description: string;
    };
    student_detail: {
      title: string;
      description: string;
      fallback_title: string;
      fallback_description: string;
    };
  };
  not_found: {
    title: string;
    heading: string;
    description: string;
    go_back: string;
    home: string;
  };
  navbar: {
    menu_open: string;
    menu: string;
    theme: string;
    language: string;
    legal: string;
    terms: string;
    privacy: string;
    mobile_menu_title: string;
    mobile_menu_desc: string;
    toggle_theme: string;
  };
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    button: string;
    success: string;
    error: string;
  };
  legal: {
    cookie_consent: {
      title: string;
      description: string;
      accept: string;
      decline: string;
    };
    title: string;
    description: string;
    read_more: string;
    nav: {
      terms: string;
      privacy: string;
      cookies: string;
      kvkk: string;
      back_to_home: string;
    };
    footer: {
      rights_reserved: string;
    };
    docs: {
      terms: {
        title: string;
        description: string;
      };
      privacy: {
        title: string;
        description: string;
      };
      cookies: {
        title: string;
        description: string;
      };
      kvkk: {
        title: string;
        description: string;
      };
    };
    terms_title: string;
    privacy_title: string;
    accept_terms: string;
    validation_terms: string;
    validation_error: string;
    marketing_consent: string;
    center: string;
    terms: string;
    privacy: string;
    cookies: string;
    kvkk: string;
    legal_suffix: string;
    legal_center: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
    toggle_theme: string;
    loading: string;
  };
  dashboard: {
    nav: {
      dashboard: string;
      students: string;
      schedule: string;
      finance: string;
      settings: string;
      lessons: string;
      homework: string;
      exams: string;
      logout: string;
      menu_title: string;
      menu_desc: string;
    };
    join: {
      error: string;
      error_desc: string;
      already_used: string;
      already_used_desc: string;
      welcome_title: string;
      unknown_teacher: string;
      unknown_student: string;
      invite_desc: string;
      login_desc: string;
      login_button: string;
      register_button: string;
      title: string;
      desc: string;
      confirm_checkbox: string;
      confirm_button: string;
      email_not_verified: string;
      teacher_cannot_join: string;
      teacher_cannot_join_desc: string;
      success_title: string;
      success_desc: string;
      go_dashboard: string;
      error_generic: string;
      already_student: string;
      guest_error: string;
      reject: string;
      conflict: {
        title: string;
        desc: string;
        your_profile: string;
        teacher_record: string;
        selected_source: string;
        yours: string;
        teachers: string;
        save_join: string;
        cancel: string;
        labels: {
          name: string;
          phone: string;
          bio: string;
          student_no: string;
          grade: string;
          parent: string;
        };
      };
    };
    header: {
      search_placeholder: string;
      profile: string;
      settings: string;
      logout: string;
    };
    students: {
      title: string;
      add_student: string;
      search_placeholder: string;
      no_results: string;
      columns: {
        name: string;
        no: string;
        class: string;
        level: string;
        phone: string;
        status: string;
        actions: string;
        invite: string;
      };
      actions: {
        edit: string;
        archive: string;
        delete: string;
        copy_invite: string;
        view_invite_link: string;
        regenerate_link: string;
        share: string;
        view_details: string;
        lessons: string;
        settings: string;
        classes: string;
        assign_homework: string;
        whatsapp: string;
        sms: string;
        coming_soon: string;
      };
      status: {
        shadow: string;
        active: string;
        verified: string;
        pending: string;
      };
      table: {
        name: string;
        status: string;
        student_no: string;
        grade: string;
        actions: string;
      };
      add_dialog: {
        title: string;
        desc: string;
        name: string;
        surname: string;
        student_no: string;
        grade: string;
        phone_number: string;
        submit: string;
        email: string;
        email_placeholder: string;
        classrooms: string;
        select_classrooms: string;
        avatar: string;
        upload_photo: string;
        or_choose: string;
        cancel: string;
        save: string;
        clear: string;
        search_classroom: string;
        no_classroom_found: string;
        select_grade: string;
        success: string;
        copy_invite: string;
        grades: {
          graduated: string;
          suffix: string;
        };
      };
    };
    student: {
      upcoming_lessons: string;
      completed_lessons: string;
      pending_homework: string;
      no_upcoming_lessons: string;
      next_lesson: string;
      assignments_todo: string;
      weekly_schedule: string;
      no_pending_homework: string;
      due_date: string;
    };
    teacher: {
      active_students: string;
      today_lessons_count: string;
      pending_homework_count: string;
      upcoming_lessons: string;
      no_lessons_today: string;
      take_attendance: string;
      quick_actions: {
        title: string;
        add_student: string;
        add_lesson: string;
        create_homework: string;
        receive_payment: string;
      };
    };
    common: {
      loading: string;
      save: string;
      cancel: string;
      delete_confirm: string;
      delete_desc: string;
      continue: string;
    };
    welcome_title: string;
    contact_support: string;
  };
  common: {
    save: string;
    saved: string;
    all_rights_reserved: string;
    copyright: string;
    copyright_long: string;
    error_occurred: string;
    back: string;
    back_to_home: string;
    toggle_password_visibility: string;
    cancel?: string;
    continue?: string;
    password_placeholder: string;
    patreon_profile: string;
    brand_name: string;
    print: string;
    zoom: string;
    crop_preview: string;
    crop_save: string;
    edit_photo: string;
    crop_description: string;
    more_options: string;
    copied: string;
    copied_desc: string;
    copy_failed: string;
    skip_to_content: string;
    close: string;
    reset: string;
    separator: string;
    date_format_long: string;
    empty_placeholder: string;
    google: string;
    theme: {
      light: string;
      dark: string;
      system: string;
      toggle_theme: string;
      loading: string;
    };
    student_initials: string;
    app_name: string;
    loading: string;
    avatar: string;
    phone_input: {
      search_placeholder: string;
      no_results: string;
      country_selector: string;
    };
  };
  repro?: {
    title: string;
  };
  teacher: {
    invite_link_copied: string;
    invite_link_copy_failed: string;
    copy_invite_link: string;
  };
  components: {
    phone_input: {
      search_country: string;
      no_country_found: string;
      country_selector_label: string;
    };
  };
  student_detail: {
    tabs: {
      overview: string;
      lessons: string;
      homework: string;
      finance: string;
      settings: string;
      exams: string;
      attendance: string;
      classes: string;
    };
    profile: {
      title: string;
      desc: string;
      contact_parent: string;
      save: string;
      archive_student: string;
      delete_student: string;
      update_success: string;
      update_error: string;
      archive_confirm: string;
      delete_confirm: string;
    };
    header: {
      total_lessons: string;
      balance: string;
      invite_link: string;
      status: {
        active: string;
        shadow: string;
      };
      verified: string;
      pending: string;
      no_level: string;
      no_number: string;
      copy_link: string;
      link_copied: string;
      unknown_student: string;
    };
    overview: {
      general_info: string;
      student_no: string;
      grade: string;
      phone: string;
      email: string;
      parent_info: string;
      parent_name: string;
      parent_phone: string;
      parent_email: string;
      private_notes: string;
      private_notes_placeholder: string;
      no_notes: string;
      total_lessons: string;
    };
    lessons: {
      title: string;
      add_lesson: string;
      no_lessons: string;
      empty: string;
      status: {
        scheduled: string;
        completed: string;
        cancelled: string;
        missed: string;
      };
      table: {
        date: string;
        title: string;
        status: string;
        price: string;
      };
    };
    finance: {
      title: string;
      receive_payment: string;
      lesson_fee: string;
      payment_received: string;
      balance: string;
      no_transactions: string;
      empty: string;
      table: {
        date: string;
        type: string;
        description: string;
        amount: string;
      };
    };
    homework: {
      title: string;
      assign_homework: string;
      no_homework: string;
      status: {
        pending: string;
        completed: string;
      };
      table: {
        due_date: string;
        title: string;
        status: string;
        lesson: string;
      };
    };
    exams: {
      title: string;
      no_exams: string;
    };
    attendance: {
      title: string;
      present: string;
      absent: string;
      late: string;
      history: string;
      no_records: string;
    };
    settings: {
      title: string;
      description: string;
      profile_photo: string;
      change_photo: string;
      personal_info: string;
      full_name: string;
      email: string;
      student_number: string;
      grade_level: string;
      contact_info: string;
      parent_information: string;
      parent_full_name: string;
      parent_phone_number: string;
      parent_email_address: string;
      invite_link: string;
      invite_link_desc: string;
      invite_link_active: string;
      invite_link_inactive: string;
      copy_link: string;
      danger_zone: string;
      danger_zone_desc: string;
      delete_student: string;
      delete_student_desc: string;
      delete_button: string;
      save_changes: string;
      saving: string;
      success: string;
      error_message: string;
      invite_toggled: string;
      link_copied: string;
      custom_name: string;
      custom_name_desc: string;
      phone: string;
      phone_desc: string;
      phone_claimed_desc: string;
      notes: string;
      notes_desc: string;
      claimed_profile: string;
      claimed_profile_desc: string;
      real_first_name: string;
      real_last_name: string;
      photo_claimed_desc: string;
      name_placeholder: string;
      student_no_placeholder: string;
      grade_placeholder: string;
      invite_link_status: string;
      archive: {
        title: string;
        desc: string;
        button: string;
        confirm_title: string;
        confirm_desc: string;
        success: string;
      };
      delete: {
        title: string;
        desc: string;
        button: string;
        confirm_title: string;
        confirm_desc: string;
        success: string;
      };
    };
  };
  join: {
    title: string;
    desc: string;
    success: string;
    error_used: string;
    accept_button: string;
    welcome_user: string;
  };
  auth: {
    placeholders: {
      email: string;
      password: string;
    };
    register: {
      title: string;
      subtitle: string;
      hero_title: string;
      hero_desc: string;
      mobile_hint: string;
      role_select: string;
      student: string;
      student_desc: string;
      teacher: string;
      teacher_desc: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      password: string;
      password_confirm: string;
      confirm_password: string;
      submit: string;
      submitting: string;
      have_account: string;
      login_link: string;
      success_title: string;
      success_desc: string;
      errors: {
        user_exists: string;
        generic: string;
        invalid_data: string;
      };
      validation: {
        first_name_min: string;
        last_name_min: string;
        email_invalid: string;
        phone_min: string;
        role_required: string;
        password_min: string;
        password_regex: string;
        password_mismatch: string;
        password_required: string;
      };
    };
    login: {
      title: string;
      subtitle: string;
      hero_title: string;
      hero_desc: string;
      card_title: string;
      card_desc: string;
      mobile_hint: string;
      chip: string;
      google_login: string;
      or_email: string;
      email: string;
      placeholder_email: string;
      password: string;
      forgot_password_link: string;
      submit: string;
      no_account: string;
      register_link: string;
      back_to_home: string;
      validation: {
        email_invalid: string;
        password_required: string;
        invalid_credentials: string;
      };
    };
    forgot_password: {
      title: string;
      desc: string;
      mobile_hint: string;
      chip: string;
      email_label: string;
      submit: string;
      submitting: string;
      back_to_login: string;
      try_again: string;
      success: string;
    };
    reset_password: {
      title: string;
      desc: string;
      new_password: string;
      confirm_password: string;
      submit: string;
      submitting: string;
      success: string;
      success_title: string;
      success_desc: string;
      invalid_token: string;
      expired_token: string;
      user_not_found: string;
      invalid_link_title: string;
      invalid_link_desc: string;
      same_password: string;
    };
    onboarding: {
      title: string;
      subtitle: string;
      submit: string;
      submitting: string;
    };
    verification: {
      unverified_title: string;
      unverified_desc: string;
      resend_button: string;
      sending: string;
      wait: string;
      success: string;
      error: string;
      user_not_found: string;
      already_verified: string;
    };
    verify_page: {
      verifying: string;
      success_title: string;
      error_title: string;
      verifying_desc: string;
      missing_token: string;
      resend_button: string;
      back_to_login: string;
      messages: {
        invalid_token: string;
        expired_token: string;
        user_not_found: string;
        success: string;
        error: string;
      };
    };
    errors: {
      generic: string;
    };
  };
  home: {
    home: string;
    hero_title: string;
    hero_subtitle: string;
    get_started: string;
    login: string;
    features: {
      title: string;
      scheduling_title: string;
      scheduling_desc: string;
      students_title: string;
      students_desc: string;
      progress_title: string;
      progress_desc: string;
      communication_title: string;
      communication_desc: string;
      payments_title: string;
      payments_desc: string;
      guardians_title: string;
      guardians_desc: string;
      resources_title: string;
      resources_desc: string;
      mobile_title: string;
      mobile_desc: string;
      badge: string;
      subtitle: string;
    };
    stats: {
      teachers_label: string;
      teachers_suffix: string;
      teachers_hint: string;
      students_label: string;
      students_suffix: string;
      students_hint: string;
      lessons_label: string;
      lessons_suffix: string;
      lessons_hint: string;
    };
    how_it_works: {
      title: string;
      subtitle: string;
      step1_title: string;
      step1_desc: string;
      step2_title: string;
      step2_desc: string;
      step3_title: string;
      step3_desc: string;
      step_1: string;
      step_2: string;
      step_3: string;
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
    };
    mock_dashboard: {
      attendance: string;
      attendance_value: string;
      attendance_change: string;
      active_students: string;
      active_students_value: string;
      classes_today: string;
      classes_today_value: string;
      schedule: string;
      math: string;
      physics: string;
      chemistry: string;
      biology: string;
      active: string;
      pending: string;
      completed: string;
      exam_results: string;
      class_average: string;
      weekly: string;
      dashboard_title: string;
      overview: string;
      students: string;
      finance: string;
      room: string;
      class_name: string;
      room_number: string;
      average_score: string;
      graphic_schedule: string;
      graphic_profile: string;
      graphic_performance: string;
      graphic_analysis: string;
      assignments: string;
      assignments_pending: string;
      assignment_math_title: string;
      assignment_physics_title: string;
      assignment_lit_title: string;
      literature: string;
      due_tomorrow: string;
      due_3days: string;
      announcements: string;
      school_board: string;
      announcement_exam_title: string;
      announcement_exam_desc: string;
      announcement_match_title: string;
      announcement_match_desc: string;
      see_all: string;
      lab: string;
      carousel_back: {
        desc: string;
        feature_1: string;
        feature_2: string;
        feature_3: string;
      };
      time_ago: {
        "10_min": string;
        "2_hours": string;
      };
      vs_last_month: string;
      chart: {
        completed: string;
        remaining: string;
      };
      success: string;
      carousel_instructions: {
        swipe: string;
        hold: string;
      };
    };
    footer: {
      built_by: string;
      source_code: string;
      github: string;
      patreon: string;
      brand: string;
      support: string;
      platform: string;
      legal: string;
      patent: string;
    };
  };
  email: {
    verification: {
      subject: string;
      title: string;
      greeting: string;
      body: string;
      button: string;
      ignore: string;
      footer: string;
      website: string;
      support: string;
      footer_disclaimer: string;
      footer_address: string;
      footer_copyright: string;
      footer_terms: string;
      footer_privacy: string;
    };
    password_reset: {
      subject: string;
      title: string;
      greeting: string;
      body: string;
      button: string;
      ignore: string;
      footer: string;
      website: string;
      support: string;
      footer_disclaimer: string;
      footer_address: string;
      footer_copyright: string;
      footer_terms: string;
      footer_privacy: string;
    };
  };
  errors: {
    unauthorized: string;
    teacher_profile_not_found: string;
    student_not_found: string;
    invalid_fields: string;
    failed_to_create_student: string;
    failed_to_update_student: string;
    failed_to_delete_student: string;
    failed_to_upload_avatar: string;
    generic_error: string;
    name_min_length: string;
    surname_min_length: string;
    invalid_email: string;
    login_validation_failed: string;
    login_failed: string;
    email_not_verified: string;
    resend_cooldown: string;
    resend_error: string;
    registration_error: string;
    verification_error: string;
    forgot_password_error: string;
    reset_password_error: string;
    onboarding_error: string;
    session_not_found: string;
    accept_terms: string;
    phone_required: string;
    password_required: string;
    passwords_mismatch: string;
    password_min_length: string;
    password_complexity: string;
    invalid_token: string;
    profile_already_claimed: string;
    invite_expired: string;
    failed_to_claim_profile: string;
    failed_to_fetch_invite: string;
    failed_to_fetch_profile: string;
    no_relation_found: string;
    student_archived: string;
    failed_to_archive_student: string;
    student_unlinked: string;
    shadow_student_deleted: string;
    relation_not_found: string;
    cannot_delete_claimed: string;
    invite_regenerated: string;
    failed_to_regenerate_token: string;
    invite_opened: string;
    invite_closed: string;
    failed_to_toggle_invite: string;
    info_updated: string;
    failed_to_update_settings: string;
    update_failed: string;
    file_not_found: string;
    file_not_found_or_error: string;
    unknown_error: string;
    phone_start_zero: string;
  };
  support: {
    nav: {
      faq: string;
      support: string;
    };
    hero: {
      title: string;
      subtitle: string;
      search_placeholder: string;
    };
    faq: {
      title: string;
      no_results: string;
      no_results_desc: string;
      categories: {
        general: string;
        billing: string;
        teachers: string;
        students: string;
      };
      items: {
        general: { question: string; answer: string }[];
        billing: { question: string; answer: string }[];
        teachers: { question: string; answer: string }[];
        students: { question: string; answer: string }[];
      };
    };
    cta: {
      title: string;
      subtitle: string;
      button_contact: string;
      button_chat: string;
    };
    contact: {
      title: string;
      subtitle: string;
      info: {
        email: string;
        email_label: string;
        office: string;
        chat_label: string;
        chat_desc: string;
        phone_label: string;
        phone_desc: string;
      };
      form: {
        name: string;
        name_placeholder: string;
        email: string;
        email_placeholder: string;
        subject: string;
        subject_placeholder: string;
        type_label: string;
        type_placeholder: string;
        message: string;
        message_placeholder: string;
        submit: string;
        submitting: string;
        success_title: string;
        success_description: string;
        error_title: string;
        error_description: string;
        types: {
          general: string;
          bug: string;
          billing: string;
          feature: string;
        };
        validation: {
          name_required: string;
          email_invalid: string;
          subject_min: string;
          type_required: string;
          message_min: string;
        };
      };
    };
  };
}
