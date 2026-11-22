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

  // REAL STUDENT TEMPLATE:
  // { rank: 1, name: "Full Name", usn: "2BA24EC001", sgpa: "9.80",
  //   photo: "images/toppers/filename.jpg", alt: "Photo of Full Name", sample: false }

  window.TOPPERS_DATA = [
    {
      id: "batch-2024-25",
      label: "Batch 2024\u201325",
      theme: "teal",
      semesters: [
        {
          number: 1, label: "1st Semester", students: [
            { rank: 1, name: "Rajeshwari Sadalapur", usn: "2BA24UE030", sgpa: "7.80", photo: "toppers/Rajeshwari.jpeg", alt: "Photo of Rajeshwari Sadalapur", sample: false },
            { rank: 2, name: "Sampada Angadi", usn: "2BA24UE35", sgpa: "7.80", photo: "images/topper-demo.svg", alt: "Photo of Sampada Angadi", sample: false },
            { rank: 3, name: "Vijayashanti Pattar", usn: "2BA24UE034", sgpa: "7.75", photo: "toppers/Vijayashanti.jpg", alt: "Photo of Vijayashanti Pattar", sample: false },
            { rank: 4, name: "Sristi Patil", usn: "2BA24UE034", sgpa: "7.65", photo: "toppers/Sristi.jpeg", alt: "Photo of Sristi Patil", sample: false }
          ]
        },
        {
          number: 2, label: "2nd Semester", students: [
          { rank: 1, name: "Vaishnavi K", usn: "2BA24UE030", sgpa: "8.60", photo: "toppers/Vaishnavi.jpeg", alt: "Photo of Rajeshwari Sadalapur", sample: false },
          { rank: 2, name: "Rakshita M", usn: "2BA24UE31", sgpa: "8.29", photo: "toppers/Rakshita.jpeg", alt: "Photo of Sampada Angadi", sample: false },
          { rank: 3, name: "Vijayashanti Pattar", usn: "2BA24UE034", sgpa: "8.25", photo: "toppers/Vijayashanti.jpg", alt: "Photo of Vijayashanti Pattar", sample: false },
          { rank: 4, name: "Rajeshwari Sadalapur", usn: "2BA24UE030", sgpa: "8.15", photo: "toppers/Rajeshwari.jpeg", alt: "Photo of Sristi Patil", sample: false }]
        },
        {
          number: 3, label: "3rd Semester", students: [
          { rank: 1, name: "Rajeshwari Sadalapur", usn: "2BA24UE030", sgpa: "7.80", photo: "toppers/Rajeshwari.jpeg", alt: "Photo of Rajeshwari Sadalapur", sample: false },
          { rank: 2, name: "Sampada Angadi", usn: "2BA24UE35", sgpa: "7.80", photo: "images/topper-demo.svg", alt: "Photo of Sampada Angadi", sample: false },
          { rank: 3, name: "Vijayashanti Pattar", usn: "2BA24UE034", sgpa: "7.75", photo: "toppers/Vijayashanti.jpg", alt: "Photo of Vijayashanti Pattar", sample: false },
          { rank: 4, name: "Sristi Patil", usn: "2BA24UE034", sgpa: "7.65", photo: "toppers/Sristi.jpeg", alt: "Photo of Sristi Patil", sample: false }]
        },
        {
          number: 4, label: "4th Semester", students: [
          { rank: 1, name: "Soundarya", usn: "2BA24UE030", sgpa: "7.80", photo: "toppers/Soundarya.jpeg", alt: "Photo of Rajeshwari Sadalapur", sample: false },
          { rank: 2, name: "Vaibhavi", usn: "2BA24UE35", sgpa: "7.80", photo: "toppers/Vaibhavi.jpeg", alt: "Photo of Sampada Angadi", sample: false },
          { rank: 3, name: "Vaishnavi K", usn: "2BA24UE034", sgpa: "7.75", photo: "toppers/Vaishnavi.jpeg", alt: "Photo of Vijayashanti Pattar", sample: false },
          { rank: 4, name: "Keyur Gujarathi", usn: "2BA24UE016", sgpa: "7.65", photo: "toppers/Keyur.jpeg", alt: "Photo of Sristi Patil", sample: false }]
        }
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
