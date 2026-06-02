<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\LabTest;
use App\Models\Notification;
use App\Models\Package;
use App\Models\Patient;
use App\Models\Report;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAdmin();
        $this->seedDoctors();
        $this->seedLabTests();
        $this->seedPackages();
        $this->seedTestPatient();
    }

    private function seedAdmin(): void
    {
        Admin::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@medihub.lk')],
            [
                'name' => 'MediHub Admin',
                // 'hashed' cast on the Admin model hashes this on save.
                'password' => env('ADMIN_PASSWORD', 'medihub123'),
            ],
        );
    }

    private function seedDoctors(): void
    {
        $doctors = [
            [
                'name' => 'Dr. Nimal Perera',
                'slug' => 'dr-nimal-perera',
                'specialization' => 'General Physician',
                'qualifications' => 'MBBS (Colombo), MD (Internal Medicine)',
                'bio' => 'Dr. Nimal Perera has over 18 years of experience in general medicine and preventive care.',
                'consultation_fee' => 2500.00,
                'languages' => ['en', 'si'],
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'name' => 'Dr. Anjali Fernando',
                'slug' => 'dr-anjali-fernando',
                'specialization' => 'Paediatrician',
                'qualifications' => 'MBBS, DCH, MD (Paediatrics)',
                'bio' => 'Dr. Anjali Fernando specialises in child health, developmental assessments, and immunisation.',
                'consultation_fee' => 3000.00,
                'languages' => ['en', 'si', 'ta'],
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'name' => 'Dr. Saman Wickramasinghe',
                'slug' => 'dr-saman-wickramasinghe',
                'specialization' => 'Cardiologist',
                'qualifications' => 'MBBS, MD (Cardiology), FRCP',
                'bio' => 'Consultant cardiologist with a focus on preventive cardiology and lifestyle interventions.',
                'consultation_fee' => 3500.00,
                'languages' => ['en', 'si'],
                'is_active' => true,
                'display_order' => 3,
            ],
        ];

        foreach ($doctors as $data) {
            $doctor = Doctor::query()->create($data);

            foreach (['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as $day) {
                DoctorSchedule::query()->create([
                    'doctor_id' => $doctor->id,
                    'day_of_week' => $day,
                    'start_time' => '09:00:00',
                    'end_time' => '17:00:00',
                    'slot_minutes' => 15,
                    'max_patients' => 20,
                    'is_active' => true,
                ]);
            }
        }
    }

    private function seedLabTests(): void
    {
        $tests = [
            // Hematology
            ['T0001', 'Full Blood Count (FBC)', 'සම්පූර්ණ රුධිර ගණනය', 'முழு இரத்த எண்ணிக்கை', 800, 'Hematology'],
            ['T0002', 'ESR', 'ඊඑස්ආර්', 'ESR', 400, 'Hematology'],
            ['T0003', 'Haemoglobin', 'හිමොග්ලෝබින්', 'ஹீமோகுளோபின்', 350, 'Hematology'],
            ['T0004', 'Blood Group & Rh', 'රුධිර කාණ්ඩය', 'இரத்த வகை', 500, 'Hematology'],
            // Biochemistry
            ['T0010', 'Fasting Blood Sugar', 'උපවාස රුධිර සීනි', 'உண்ணா இரத்த சர்க்கரை', 600, 'Biochemistry'],
            ['T0011', 'HbA1c', 'HbA1c', 'HbA1c', 2200, 'Biochemistry'],
            ['T0012', 'Lipid Profile', 'ලිපිඩ පැතිකඩ', 'கொழுப்பு சுயவிவரம்', 2500, 'Biochemistry'],
            ['T0013', 'Liver Function Tests', 'අක්මා ක්‍රියාකාරිත්වය', 'கல்லீரல் செயல்பாடு', 2800, 'Biochemistry'],
            ['T0014', 'Renal Function Tests', 'වකුගඩු ක්‍රියාකාරිත්වය', 'சிறுநீரக செயல்பாடு', 2200, 'Biochemistry'],
            ['T0015', 'Serum Creatinine', 'සීරම් ක්‍රියැටිනින්', 'சீரம் கிரியேட்டினின்', 700, 'Biochemistry'],
            // Endocrinology
            ['T0020', 'TSH', 'TSH', 'TSH', 1200, 'Endocrinology'],
            ['T0021', 'Free T3', 'Free T3', 'Free T3', 1500, 'Endocrinology'],
            ['T0022', 'Free T4', 'Free T4', 'Free T4', 1500, 'Endocrinology'],
            ['T0023', 'Vitamin D (25-OH)', 'විටමින් D', 'வைட்டமின் D', 4500, 'Endocrinology'],
            // Immunology
            ['T0030', 'CRP', 'CRP', 'CRP', 1200, 'Immunology'],
            ['T0031', 'RA Factor', 'RA Factor', 'RA Factor', 1400, 'Immunology'],
            ['T0032', 'Dengue NS1 Antigen', 'ඩෙංගු NS1', 'டெங்கு NS1', 1800, 'Immunology'],
            // Microbiology
            ['T0040', 'Urine Culture', 'මුත්‍ර වගා කිරීම', 'சிறுநீர் வளர்ப்பு', 1500, 'Microbiology'],
            ['T0041', 'Urine Full Report', 'මුත්‍ර සම්පූර්ණ වාර්තාව', 'சிறுநீர் முழு அறிக்கை', 600, 'Microbiology'],
            ['T0042', 'Stool Routine', 'මළ පරීක්ෂාව', 'மலம் பரிசோதனை', 700, 'Microbiology'],
        ];

        foreach ($tests as [$code, $name, $nameSi, $nameTa, $price, $category]) {
            LabTest::query()->create([
                'code' => $code,
                'name' => $name,
                'name_si' => $nameSi,
                'name_ta' => $nameTa,
                'description' => null,
                'price' => $price,
                'category' => $category,
                'is_active' => true,
            ]);
        }
    }

    private function seedPackages(): void
    {
        $packages = [
            [
                'code' => 'PKG-FULL-BODY',
                'name' => 'Full Body Check-up',
                'name_si' => 'සම්පූර්ණ ශරීර පරීක්ෂණය',
                'name_ta' => 'முழு உடல் பரிசோதனை',
                'description' => 'A comprehensive screening package covering blood, cardiac, kidney, liver and diabetes markers — ideal for an annual health review.',
                'original_price' => 18000,
                'discounted_price' => 13500,
                'validity_days' => 365,
                'total_visits' => 1,
                'inclusions' => [
                    'General physician consultation',
                    'Full Blood Count',
                    'Fasting Blood Sugar',
                    'Lipid Profile',
                    'Liver Function Tests',
                    'Renal Function Tests',
                    'TSH',
                    'Urine Full Report',
                ],
                'included_test_codes' => ['T0001', 'T0010', 'T0012', 'T0013', 'T0014', 'T0020', 'T0041'],
                'is_featured' => true,
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'code' => 'PKG-DIABETES',
                'name' => 'Diabetes Care Package',
                'name_si' => 'දියවැඩියා රැකවරණ පැකේජය',
                'name_ta' => 'நீரிழிவு பராமரிப்பு தொகுப்பு',
                'description' => 'Quarterly monitoring package for people living with type 2 diabetes.',
                'original_price' => 8500,
                'discounted_price' => 6200,
                'validity_days' => 90,
                'total_visits' => 1,
                'inclusions' => ['Fasting Blood Sugar', 'HbA1c', 'Renal Function Tests', 'Urine Full Report'],
                'included_test_codes' => ['T0010', 'T0011', 'T0014', 'T0041'],
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'code' => 'PKG-CARDIAC',
                'name' => 'Heart Health Package',
                'name_si' => 'හදවත් සෞඛ්‍ය පැකේජය',
                'name_ta' => 'இதய ஆரோக்கிய தொகுப்பு',
                'description' => 'Targeted cardiac screening with cardiologist consultation, lipid profile and ECG-ready evaluation.',
                'original_price' => 12500,
                'discounted_price' => 9500,
                'validity_days' => 180,
                'total_visits' => 1,
                'inclusions' => ['Cardiologist consultation', 'Lipid Profile', 'ESR', 'CRP'],
                'included_test_codes' => ['T0012', 'T0002', 'T0030'],
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'code' => 'PKG-WOMEN',
                'name' => 'Women’s Wellness Package',
                'name_si' => 'කාන්තා සුවතා පැකේජය',
                'name_ta' => 'பெண்கள் நலன் தொகுப்பு',
                'description' => 'Wellness screening for women: thyroid, vitamin D, blood profile and consultation.',
                'original_price' => 14500,
                'discounted_price' => 10800,
                'validity_days' => 365,
                'total_visits' => 1,
                'inclusions' => ['Doctor consultation', 'Full Blood Count', 'TSH', 'Vitamin D'],
                'included_test_codes' => ['T0001', 'T0020', 'T0023'],
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 4,
            ],
            [
                'code' => 'PKG-KIDS',
                'name' => 'Child Health Package',
                'name_si' => 'ළමා සෞඛ්‍ය පැකේජය',
                'name_ta' => 'குழந்தை ஆரோக்கிய தொகுப்பு',
                'description' => 'Paediatrician consultation with growth assessment and basic screening.',
                'original_price' => 6500,
                'discounted_price' => 4800,
                'validity_days' => 180,
                'total_visits' => 1,
                'inclusions' => ['Paediatrician consultation', 'Haemoglobin', 'Urine Full Report'],
                'included_test_codes' => ['T0003', 'T0041'],
                'is_featured' => false,
                'is_active' => true,
                'display_order' => 5,
            ],
        ];

        foreach ($packages as $data) {
            Package::query()->create($data);
        }
    }

    private function seedTestPatient(): void
    {
        $patient = Patient::query()->create([
            'phone' => '+94752977591',
            'name' => 'Ibrahim Test',
            // 'hashed' cast hashes this on save. Login: 0752977591 / medihub123
            'password' => 'medihub123',
            'email' => 'test@medihub.lk',
            'dob' => '1992-04-15',
            'gender' => 'male',
            'blood_group' => 'O+',
            'height_cm' => 175,
            'weight_kg' => 72,
            'language' => 'en',
        ]);

        Storage::disk('public')->makeDirectory('reports');
        Storage::disk('public')->put('reports/sample.pdf', '%PDF-1.4 sample');

        $reports = [
            ['lab', 'Full Body Check-up — Lab Report'],
            ['lab', 'Fasting Blood Sugar'],
            ['consultation', 'Cardiology Consultation Notes'],
        ];

        foreach ($reports as $i => [$type, $title]) {
            Report::query()->create([
                'patient_id' => $patient->id,
                'report_type' => $type,
                'title' => $title,
                'file_path' => 'reports/sample.pdf',
                'file_size_kb' => 240,
                'released_at' => now()->subDays($i * 7 + 1),
            ]);
        }

        Notification::query()->create([
            'patient_id' => $patient->id,
            'title' => 'Welcome to MediHub',
            'body' => 'Your health passbook is ready. Tap to explore your dashboard.',
            'type' => 'general',
            'sent_at' => now(),
        ]);
    }
}
