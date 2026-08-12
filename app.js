/* =========================================
   SCHOOL MDM DASHBOARD
   SUPABASE VERSION
========================================= */


/* =========================================
   GET HTML ELEMENTS
========================================= */

const form = document.getElementById("mdmForm");

const classNameInput =
    document.getElementById("className");

const sectionInput =
    document.getElementById("section");

const totalStudentsInput =
    document.getElementById("totalStudents");

const mdmStudentsInput =
    document.getElementById("mdmStudents");

const eggStudentsInput =
    document.getElementById("eggStudents");

const formMessage =
    document.getElementById("formMessage");

const submitBtn =
    document.getElementById("submitBtn");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

const dataTableBody =
    document.getElementById("dataTableBody");

const emptyMessage =
    document.getElementById("emptyMessage");

const refreshBtn =
    document.getElementById("refreshBtn");

const currentDate =
    document.getElementById("currentDate");

const currentTime =
    document.getElementById("currentTime");

const totalStudentsDisplay =
    document.getElementById("totalStudentsDisplay");

const totalMdmDisplay =
    document.getElementById("totalMdmDisplay");

const totalEggDisplay =
    document.getElementById("totalEggDisplay");

const submittedDisplay =
    document.getElementById("submittedDisplay");


/* =========================================
   EDIT MODE
========================================= */

let editId = null;


/* =========================================
   GET TODAY'S DATE
========================================= */

function getTodayDate() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
        .padStart(2, "0");

    const day =
        String(now.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}


/* =========================================
   UPDATE DATE & TIME
========================================= */

function updateClock() {

    const now = new Date();

    currentDate.textContent =
        now.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    currentTime.textContent =
        now.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            }
        );
}


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(message, type) {

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`;

}


/* =========================================
   CLEAR MESSAGE
========================================= */

function clearMessage() {

    formMessage.textContent = "";

    formMessage.className =
        "form-message";

}


/* =========================================
   VALIDATE FORM
========================================= */

function validateForm() {

    const total =
        Number(totalStudentsInput.value);

    const mdm =
        Number(mdmStudentsInput.value);

    const egg =
        Number(eggStudentsInput.value);


    if (
        total < 0 ||
        mdm < 0 ||
        egg < 0
    ) {

        showMessage(
            "Values cannot be negative.",
            "error"
        );

        return false;
    }


    if (mdm > total) {

        showMessage(
            "MDM students cannot exceed total students.",
            "error"
        );

        return false;
    }


    if (egg > mdm) {

        showMessage(
            "Egg students cannot exceed MDM students.",
            "error"
        );

        return false;
    }


    return true;
}


/* =========================================
   LOAD TODAY'S DATA
========================================= */

async function loadDashboard() {

    try {

        const today =
            getTodayDate();


        const {
            data,
            error
        } = await supabaseClient

            .from("mdm_entries")

            .select("*")

            .eq(
                "entry_date",
                today
            )

            .order(
                "class_name",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(error);

            showMessage(
                "Unable to load data from database.",
                "error"
            );

            return;
        }


        renderDashboard(data || []);

    } catch (error) {

        console.error(error);

        showMessage(
            "Database connection error.",
            "error"
        );

    }

}


/* =========================================
   RENDER DASHBOARD
========================================= */

function renderDashboard(entries) {

    let totalStudents = 0;

    let totalMdm = 0;

    let totalEgg = 0;


    entries.forEach(
        entry => {

            totalStudents +=
                Number(entry.total_students);

            totalMdm +=
                Number(entry.mdm_students);

            totalEgg +=
                Number(entry.egg_students);

        }
    );


    /* SUMMARY */

    totalStudentsDisplay.textContent =
        totalStudents.toLocaleString("en-IN");

    totalMdmDisplay.textContent =
        totalMdm.toLocaleString("en-IN");

    totalEggDisplay.textContent =
        totalEgg.toLocaleString("en-IN");

    submittedDisplay.textContent =
        entries.length;


    /* TABLE */

    dataTableBody.innerHTML = "";


    if (entries.length === 0) {

        emptyMessage.style.display =
            "block";

        return;
    }


    emptyMessage.style.display =
        "none";


    /* Sort class */

    entries.sort(
        (a, b) => {

            const classA =
                parseInt(
                    a.class_name
                        .replace("Class ", "")
                );

            const classB =
                parseInt(
                    b.class_name
                        .replace("Class ", "")
                );


            if (classA !== classB) {

                return classA - classB;

            }


            return a.section.localeCompare(
                b.section
            );

        }
    );


    /* CREATE ROWS */

    entries.forEach(
        entry => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(entry.class_name)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(entry.section)}
                </td>

                <td>
                    ${entry.total_students}
                </td>

                <td>
                    ${entry.mdm_students}
                </td>

                <td>
                    ${entry.egg_students}
                </td>

                <td>
                    ${formatTime(entry.entry_time)}
                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editEntry(${entry.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteEntry(${entry.id})"
                    >
                        Delete
                    </button>

                </td>

            `;


            dataTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================
   SUBMIT DATA
========================================= */

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        clearMessage();


        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }


        if (!validateForm()) {

            return;
        }


        const className =
            classNameInput.value;

        const section =
            sectionInput.value;

        const total =
            Number(totalStudentsInput.value);

        const mdm =
            Number(mdmStudentsInput.value);

        const egg =
            Number(eggStudentsInput.value);


        /* Disable button */

        submitBtn.disabled = true;

        submitBtn.textContent =
            "Saving...";


        try {

            /* =================================
               EDIT EXISTING DATA
            ================================= */

            if (editId !== null) {

                const {
                    error
                } = await supabaseClient

                    .from("mdm_entries")

                    .update({

                        class_name:
                            className,

                        section:
                            section,

                        total_students:
                            total,

                        mdm_students:
                            mdm,

                        egg_students:
                            egg

                    })

                    .eq(
                        "id",
                        editId
                    );


                if (error) {

                    console.error(error);

                    showMessage(
                        "Unable to update data.",
                        "error"
                    );

                    return;
                }


                showMessage(
                    "Data updated successfully.",
                    "success"
                );


                resetForm();

                await loadDashboard();

                return;
            }


            /* =================================
               NEW ENTRY
            ================================= */

            const {
                error
            } = await supabaseClient

                .from("mdm_entries")

                .insert({

                    entry_date:
                        getTodayDate(),

                    class_name:
                        className,

                    section:
                        section,

                    total_students:
                        total,

                    mdm_students:
                        mdm,

                    egg_students:
                        egg

                });


            if (error) {

                console.error(error);


                /* Duplicate entry */

                if (
                    error.code === "23505"
                ) {

                    showMessage(
                        `Data for ${className} - Section ${section} has already been submitted today.`,
                        "error"
                    );

                }

                else {

                    showMessage(
                        error.message ||
                        "Unable to save data.",
                        "error"
                    );

                }

                return;
            }


            showMessage(
                "Data submitted successfully.",
                "success"
            );


            resetForm();


            await loadDashboard();


        } catch (error) {

            console.error(error);

            showMessage(
                "Something went wrong while saving data.",
                "error"
            );

        }

        finally {

            submitBtn.disabled = false;

            submitBtn.textContent =
                editId !== null
                    ? "Update Data"
                    : "Submit Data";

        }

    }
);


/* =========================================
   EDIT ENTRY
========================================= */

async function editEntry(id) {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("mdm_entries")

            .select("*")

            .eq(
                "id",
                id
            )

            .single();


        if (error) {

            console.error(error);

            showMessage(
                "Unable to load entry.",
                "error"
            );

            return;
        }


        classNameInput.value =
            data.class_name;

        sectionInput.value =
            data.section;

        totalStudentsInput.value =
            data.total_students;

        mdmStudentsInput.value =
            data.mdm_students;

        eggStudentsInput.value =
            data.egg_students;


        editId =
            data.id;


        submitBtn.textContent =
            "Update Data";

        cancelEditBtn.classList.remove(
            "hidden"
        );


        showMessage(
            "Editing existing data.",
            "success"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to edit entry.",
            "error"
        );

    }

}


/* =========================================
   DELETE ENTRY
========================================= */

async function deleteEntry(id) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this entry?"
        );


    if (!confirmation) {

        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from("mdm_entries")

            .delete()

            .eq(
                "id",
                id
            );


        if (error) {

            console.error(error);

            showMessage(
                "Delete failed.",
                "error"
            );

            return;
        }


        showMessage(
            "Data deleted successfully.",
            "success"
        );


        await loadDashboard();


    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to delete data.",
            "error"
        );

    }

}


/* =========================================
   CANCEL EDIT
========================================= */

cancelEditBtn.addEventListener(
    "click",
    function() {

        resetForm();

        clearMessage();

    }
);


/* =========================================
   RESET FORM
========================================= */

function resetForm() {

    form.reset();

    editId = null;

    submitBtn.textContent =
        "Submit Data";

    cancelEditBtn.classList.add(
        "hidden"
    );

}


/* =========================================
   REFRESH
========================================= */

refreshBtn.addEventListener(
    "click",
    async function() {

        refreshBtn.disabled = true;

        refreshBtn.textContent =
            "Refreshing...";


        await loadDashboard();


        refreshBtn.disabled = false;

        refreshBtn.textContent =
            "↻ Refresh";

    }
);


/* =========================================
   HTML SECURITY
========================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   INITIALIZE
========================================= */

updateClock();

loadDashboard();


/* =========================================
   LIVE CLOCK
========================================= */

setInterval(
    updateClock,
    1000
);


// ==========================================
// THOUGHT & WORD OF THE DAY
// ==========================================

async function loadDailyContent() {

    const today = new Date().toISOString().split("T")[0];

    try {

        const { data, error } = await supabaseClient
            .from("daily_thought_word")
            .select("*")
            .eq("content_date", today)
            .maybeSingle();

        if (error) {

            console.error("Daily content load error:", error);

            return;
        }

        // No content submitted today
        if (!data) {

            document.getElementById("dashboardThought").textContent =
                "Not added yet.";

            document.getElementById("dashboardWord").textContent =
                "Not added yet.";

            document.getElementById("thoughtInput").disabled = false;

            document.getElementById("wordInput").disabled = false;

            document.getElementById("dailyContentSubmit").disabled = false;

            document.getElementById("dailyContentMessage").textContent =
                "";

            return;
        }

        // ======================================
        // TODAY'S CONTENT EXISTS
        // ======================================

        document.getElementById("dashboardThought").textContent =
            data.thought;

        document.getElementById("dashboardWord").textContent =
            data.word;

        // Show saved values in the boxes
        document.getElementById("thoughtInput").value =
            data.thought;

        document.getElementById("wordInput").value =
            data.word;

        // Disable for the rest of today
        document.getElementById("thoughtInput").disabled = true;

        document.getElementById("wordInput").disabled = true;

        document.getElementById("dailyContentSubmit").disabled = true;

        document.getElementById("dailyContentMessage").textContent =
            "Today's Thought and Word have already been submitted.";

    }
    catch (error) {

        console.error("Daily content error:", error);

    }
}


// ==========================================
// SAVE TODAY'S THOUGHT & WORD
// ==========================================

async function saveDailyContent() {

    const thought =
        document.getElementById("thoughtInput").value.trim();

    const word =
        document.getElementById("wordInput").value.trim();

    const message =
        document.getElementById("dailyContentMessage");


    if (!thought || !word) {

        message.textContent =
            "Please enter both Thought and Word.";

        return;
    }


    const today =
        new Date().toISOString().split("T")[0];


    const button =
        document.getElementById("dailyContentSubmit");

    button.disabled = true;


    try {

        const { error } = await supabaseClient
            .from("daily_thought_word")
            .insert({
                content_date: today,
                thought: thought,
                word: word
            });


        if (error) {

            console.error("Daily content save error:", error);

            if (error.code === "23505") {

                message.textContent =
                    "Today's Thought and Word have already been submitted.";

                await loadDailyContent();

            }
            else {

                message.textContent =
                    "Unable to save today's content.";

                button.disabled = false;
            }

            return;
        }


        // Successful submission
        message.textContent =
            "Today's Thought and Word submitted successfully.";

        await loadDailyContent();

    }
    catch (error) {

        console.error("Daily content exception:", error);

        message.textContent =
            "Unable to save today's content.";

        button.disabled = false;
    }
}


// ==========================================
// LOAD WHEN WEBSITE OPENS
// ==========================================

loadDailyContent();