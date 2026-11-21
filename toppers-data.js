/* ==========================================================================
   SEMESTER TOPPERS - DATA FILE (edit this file only)
   --------------------------------------------------------------------------
   Every name, USN, SGPA and photo below is SAMPLE CONTENT, not real students.
   To publish:
     1. Replace name, usn, sgpa and photo for each student.
     2. Set  sample: false  on that student (removes the "Sample" tags on the card).
     3. When all 22 students are real, set  SAMPLE_NOTICE_VISIBLE = false.
   Photos: put the file in images/toppers/ and set  photo: "images/toppers/xyz.jpg"
           (use roughly square or 4:5 portraits; they are cropped to a fixed square frame).
           Also set  alt: "Photo of <student name>"  for each real photo.
   Students are listed in rank order (first = Rank 1).
   ========================================================================== */
window.SAMPLE_NOTICE_VISIBLE = true;

(function () {
  var DEMO_PHOTO = "images/topper-demo.svg";
  var counter = 0;

  /* Builds one sample student. Edit the returned values per student below if you wish. */
  function sample(rank, sgpa) {
    counter += 1;
    return {
      rank: rank,
      name: "Sample Student " + counter,
      usn: "SAMPLE-USN-" + (counter < 10 ? "0" : "") + counter,
      sgpa: sgpa,
      photo: DEMO_PHOTO,
      alt: "Demo photo for sample student " + counter,
      sample: true
    };
  }

  window.TOPPERS_DATA = [
    {
      id: "batch-2024-25",
      label: "Batch 2024\u201325",
      theme: "teal",
      semesters: [
        { number: 1, label: "1st Semester", students: [sample(1, "9.80"), sample(2, "9.60"), sample(3, "9.40"), sample(4, "9.20")] },
        { number: 2, label: "2nd Semester", students: [sample(1, "9.78"), sample(2, "9.58"), sample(3, "9.38"), sample(4, "9.18")] },
        { number: 3, label: "3rd Semester", students: [sample(1, "9.76"), sample(2, "9.56"), sample(3, "9.36"), sample(4, "9.16")] },
        { number: 4, label: "4th Semester", students: [sample(1, "9.74"), sample(2, "9.54"), sample(3, "9.34"), sample(4, "9.14")] }
      ]
    },
    {
      id: "batch-2025-26",
      label: "Batch 2025\u201326",
      theme: "amber",
      semesters: [
        { number: 1, label: "1st Semester", students: [sample(1, "9.72"), sample(2, "9.52"), sample(3, "9.32")] },
        { number: 2, label: "2nd Semester", students: [sample(1, "9.70"), sample(2, "9.50"), sample(3, "9.30")] }
      ]
    }
  ];
})();
