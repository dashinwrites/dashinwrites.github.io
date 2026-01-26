const deployID = 'AKfycbyqMgf9ST73pRkrzfvwc5iBrJSedvHbn_0ESPKblzXVqagA680oyNrgKEpspKZHaclt';
const sheetID = `1WtJG6Z0Ar1LtKDrgN1VbsIcMGkRDCiQ4oOHImPBla4Y`;
const oldSheetID = `1XNHsAlHv62PHeXuyWfbegNueYi9QdeyvUPlJ0Qu64i0`;
const successMessage = `<p class="fullWidth">Submission successful!</p>
<button onclick="location.reload();" type="button" class="fullWidth submit">Back to form</button>`;
const threadTags = ["vital", "priority", "rapidfire", "romantic", "family", "friends", "coworkers"];
const chartColors = ['#73626E', '#F5D8BC', '#F0B49E', '#F7E4BE', '#413E4A', '#8C7077', '#D3A79F', '#A69C9E'];

const datasetOptions = {
    backgroundColor: chartColors,
    borderWidth: 5,
    borderColor: '#3e3e3e'
};

const chartOptions = {
    type: 'doughnut',
    options: {
        cutout: '35%',
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: localStorage.getItem('theme') === 'light' ? '#767676' : '#e7e7e7',
                    font: {
                        family: 'Nunito Sans, sans-serif',
                        size: '9',
                        weight: 'bold'
                    }
                }
            }
        }
    }
};

const noLegend = {
    scales: {
        x: {
            ticks: {
                color: localStorage.getItem('theme') === 'light' ? '#767676' : '#e7e7e7',
                font: {
                    family: 'Nunito Sans, sans-serif',
                    size: '8',
                    weight: 'bold'
                }
            }
        },
        y: {
            ticks: {
                color: localStorage.getItem('theme') === 'light' ? '#767676' : '#e7e7e7',
                font: {
                    family: 'Nunito Sans, sans-serif',
                    size: '8',
                    weight: 'bold'
                }
            }
        },
    },
    responsive: true,
    plugins: {
        legend: {
            display: false,
        }
    }
};