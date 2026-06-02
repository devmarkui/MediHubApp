<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Patient;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController
{
    /**
     * Stage 3 — admin uploads a new report file for a patient.
     */
    public function store(Request $request, Patient $patient): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'report_type' => ['required', 'in:lab,consultation,prescription,imaging'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        $file = $request->file('file');
        $path = $file->store('reports', 'public');
        $sizeKb = (int) ceil($file->getSize() / 1024);

        Report::query()->create([
            'patient_id' => $patient->id,
            'report_type' => $data['report_type'],
            'title' => $data['title'],
            'file_path' => $path,
            'file_size_kb' => $sizeKb,
            'released_at' => now(),
        ]);

        return redirect()
            ->route('admin.patients.show', $patient)
            ->with('status', 'Report uploaded.');
    }

    public function destroy(Patient $patient, Report $report): RedirectResponse
    {
        abort_if($report->patient_id !== $patient->id, 404);

        if ($report->file_path && Storage::disk('public')->exists($report->file_path)) {
            Storage::disk('public')->delete($report->file_path);
        }
        $report->delete();

        return redirect()
            ->route('admin.patients.show', $patient)
            ->with('status', 'Report removed.');
    }
}
