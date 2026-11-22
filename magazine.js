const monthSelect = document.getElementById('monthSelect');
const emptyState = document.getElementById('emptyState');
const viewerContainer = document.getElementById('viewerContainer');
const magazineFrame = document.getElementById('magazineFrame');
const downloadLink = document.getElementById('downloadLink');

monthSelect.addEventListener('change', () => {
  const pdfPath = monthSelect.value;
  if (!pdfPath) {
    magazineFrame.src = 'about:blank';
    viewerContainer.hidden = true;
    emptyState.hidden = false;
    downloadLink.hidden = true;
    return;
  }

  magazineFrame.src = `${pdfPath}#view=FitH`;
  magazineFrame.title = `${monthSelect.options[monthSelect.selectedIndex].text} department magazine`;
  downloadLink.href = pdfPath;
  downloadLink.download = pdfPath.split('/').pop();
  downloadLink.hidden = false;
  emptyState.hidden = true;
  viewerContainer.hidden = false;
});
