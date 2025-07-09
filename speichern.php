<?php
$filename = "highscore.txt";

if (isset($_POST['username']) && isset($_POST['zeit'])) {
    $username = htmlspecialchars($_POST['username']);
    $zeit = htmlspecialchars($_POST['zeit']);

    $entry = "$username;$zeit\n";
    file_put_contents($filename, $entry, FILE_APPEND);

    echo "Gespeichert!";
} else {
    echo "Fehler: unvollständige Daten";
}
?>
