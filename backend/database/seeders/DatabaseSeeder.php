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
use Illuminate\Support\Str;

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
        // MediHub Consultant Panel. Each session becomes a 2-hour bookable window
        // (15-minute slots) on the listed day(s).
        $allWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

        $doctors = [
            [
                'name' => 'Dr. H.R. Mohammed',
                'specialization' => 'VOG (Obstetrician–Gynecologist)',
                'qualifications' => 'MBBS, MS (OBG)',
                'fee' => 3000,
                'languages' => ['en', 'si', 'ta'],
                'sessions' => array_map(fn ($d) => [$d, '12:00:00', '14:00:00'], $allWeek),
            ],
            [
                'name' => 'Dr. Karu Prassanna',
                'specialization' => 'Physician (VP)',
                'qualifications' => 'MBBS, MD (General Medicine)',
                'fee' => 2500,
                'languages' => ['en', 'si', 'ta'],
                'sessions' => [['wed', '17:00:00', '19:00:00'], ['sun', '15:00:00', '17:00:00']],
            ],
            [
                'name' => 'Dr. (Mrs) Apeksha Perera',
                'specialization' => 'Dermatologist',
                'qualifications' => 'MBBS, MD (Dermatology)',
                'fee' => 3000,
                'languages' => ['en', 'si'],
                'sessions' => [['mon', '16:00:00', '18:00:00']],
            ],
            [
                'name' => 'Dr. N.P. Karunaratne',
                'specialization' => 'Dermatologist',
                'qualifications' => 'MBBS, MD (Dermatology)',
                'fee' => 3000,
                'languages' => ['en', 'si'],
                'sessions' => [['tue', '18:00:00', '20:00:00']],
            ],
            [
                'name' => 'Dr. M.I. Ahamed Ifthikar',
                'specialization' => 'Psychology Counseling',
                'qualifications' => 'MBBS, MSc (Clinical Psychology)',
                'fee' => 2500,
                'languages' => ['en', 'si', 'ta'],
                'sessions' => [['sat', '10:00:00', '12:00:00']],
            ],
            [
                'name' => 'Dr. Matheeshan',
                'specialization' => 'General Surgeon',
                'qualifications' => 'MBBS, MS (Surgery)',
                'fee' => 3500,
                'languages' => ['en', 'si', 'ta'],
                'sessions' => [['sat', '16:00:00', '18:00:00'], ['sun', '16:00:00', '18:00:00']],
            ],
            [
                'name' => 'Dr. Ananda Piyathissa',
                'specialization' => 'Pediatrician',
                'qualifications' => 'MBBS, DCH, MD (Paediatrics)',
                'fee' => 3000,
                'languages' => ['en', 'si'],
                'sessions' => [['sun', '12:30:00', '14:30:00']],
            ],
            [
                'name' => 'Dr. Subanthan',
                'specialization' => 'Radiologist (US Scan)',
                'qualifications' => 'MBBS, MD (Radiology)',
                'fee' => 4000,
                'languages' => ['en', 'si', 'ta'],
                'sessions' => [['sat', '12:00:00', '14:00:00']],
            ],
            [
                'name' => 'Dr. Krishnagar',
                'specialization' => 'Radiologist (US Scan)',
                'qualifications' => 'MBBS, MD (Radiology)',
                'fee' => 4000,
                'languages' => ['en', 'si', 'ta'],
                'sessions' => [['wed', '17:00:00', '19:00:00']],
            ],
            [
                'name' => 'Dr. Nimali Jayasuriya',
                'specialization' => 'Venereologist (STD)',
                'qualifications' => 'MBBS, MD (Venereology)',
                'fee' => 3000,
                'languages' => ['en', 'si'],
                'sessions' => [['fri', '17:00:00', '19:00:00']],
            ],
        ];

        foreach ($doctors as $i => $data) {
            $doctor = Doctor::query()->create([
                'name' => $data['name'],
                'slug' => Str::slug($data['name']),
                'specialization' => $data['specialization'],
                'qualifications' => $data['qualifications'],
                'bio' => $data['name'].' — consultant '.$data['specialization'].' at MediHub Clinic & Laboratory.',
                'consultation_fee' => $data['fee'],
                'languages' => $data['languages'],
                'is_active' => true,
                'display_order' => $i + 1,
            ]);

            foreach ($data['sessions'] as [$day, $start, $end]) {
                DoctorSchedule::query()->create([
                    'doctor_id' => $doctor->id,
                    'day_of_week' => $day,
                    'start_time' => $start,
                    'end_time' => $end,
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
        // MediHub Health Checkup Packages (flyer pricing — single price, no discount).
        // Every package also includes the free services listed below.
        $freeServices = 'Free with every package: Blood Pressure, Vision Check, Doctor Consultation, Height/Weight check & Body Composition examination. (12-hour fasting required for blood tests.)';

        $packages = [
            [
                'code' => 'PKG-BASIC',
                'name' => 'Basic Screening Package',
                'price' => 2600,
                'inclusions' => ['Full Blood Count', 'Fasting Blood Sugar', 'Lipid Profile', 'ESR', 'Urine Full Report'],
                'included_test_codes' => ['T0001', 'T0010', 'T0012', 'T0002', 'T0041'],
                'is_featured' => false,
            ],
            [
                'code' => 'PKG-ADVANCE',
                'name' => 'Advance Screening Package',
                'price' => 4250,
                'inclusions' => ['Full Blood Count', 'Fasting Blood Sugar', 'Lipid Profile', 'ESR', 'Urine Full Report', 'Serum Creatinine', 'AST / ALT'],
                'included_test_codes' => ['T0001', 'T0010', 'T0012', 'T0002', 'T0041', 'T0015', 'T0013'],
                'is_featured' => true,
            ],
            [
                'code' => 'PKG-ESSENTIAL',
                'name' => 'Essential Screening Package',
                'price' => 7500,
                'inclusions' => ['Full Blood Count', 'Fasting Blood Sugar', 'Lipid Profile', 'ESR', 'Urine Full Report', 'Serum Creatinine', 'AST / ALT', 'TSH', 'HbA1c'],
                'included_test_codes' => ['T0001', 'T0010', 'T0012', 'T0002', 'T0041', 'T0015', 'T0013', 'T0020', 'T0011'],
                'is_featured' => true,
            ],
            [
                'code' => 'PKG-KIDNEY',
                'name' => 'Kidney Screening Package',
                'price' => 5500,
                'inclusions' => ['Full Blood Count', 'Serum Electrolytes', 'Serum Creatinine', 'Blood Urea', 'Serum Calcium', 'Urine Micro Albumin', 'Urine Full Report'],
                'included_test_codes' => ['T0001', 'T0015', 'T0014', 'T0041'],
                'is_featured' => false,
            ],
            [
                'code' => 'PKG-DIABETIC',
                'name' => 'Diabetic Screening Package',
                'price' => 6250,
                'inclusions' => ['Full Blood Count', 'Fasting Blood Sugar', 'Lipid Profile', 'Serum Creatinine', 'HbA1c', 'Urine Micro Albumin', 'Urine Full Report'],
                'included_test_codes' => ['T0001', 'T0010', 'T0012', 'T0015', 'T0011', 'T0041'],
                'is_featured' => false,
            ],
        ];

        foreach ($packages as $i => $data) {
            Package::query()->create([
                'code' => $data['code'],
                'name' => $data['name'],
                'name_si' => null,
                'name_ta' => null,
                'description' => $data['name'].'. '.$freeServices,
                // Flyer shows a single price — no discount.
                'original_price' => $data['price'],
                'discounted_price' => $data['price'],
                'validity_days' => 365,
                'total_visits' => 1,
                'inclusions' => $data['inclusions'],
                'included_test_codes' => $data['included_test_codes'],
                'is_featured' => $data['is_featured'],
                'is_active' => true,
                'display_order' => $i + 1,
            ]);
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
