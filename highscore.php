<?php
$filename = "highscore.txt";

echo "<h1>Highscores</h1>";

if (file_exists($filename)) {
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    echo "<table border='1'><tr><th>Name</th><th>Zeit</th></tr>";
    foreach ($lines as $line) {
        list($name, $zeit) = explode(";", $line);
        echo "<tr><td>$name</td><td>$zeit</td></tr>";
    }
    echo "</table>";
} else {
    echo "Noch keine Einträge.";
}
?>
