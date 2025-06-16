#define NOTE_C3  131
#define NOTE_E4  330
#define NOTE_CS5 554
#define NOTE_E5  659
#define NOTE_B5  988
#define NOTE_G3  196

int led[] = {D5, D6, D7, D8};
int button[] = {D1, D2, D3, D4};
int buzzpin = D0;
int notes[] = {NOTE_C3, NOTE_E4, NOTE_CS5, NOTE_E5};

int turn = 0;
int seq[100];
int USeq[100];
int seqL = 0;
boolean played = false;

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(led[i], OUTPUT);
    pinMode(button[i], INPUT_PULLUP);
  }
  pinMode(buzzpin, OUTPUT);
  randomSeed(analogRead(A0));
  generateSeq();
  Serial.begin(9600);
}

void generateSeq() {
  for (int i = 0; i < 99; i++) {
    seq[i] = random(0, 4);
  }
}

void win() {
  for (int j = 0; j < 2; j++) {
    for (int i = 0; i < 4; i++) {
      tone(buzzpin, notes[i], 100);
      digitalWrite(led[i], HIGH);
      delay(100);
      digitalWrite(led[i], LOW);
      noTone(buzzpin);
    }
  }
  delay(500);
}

void loss() {
  // Semua LED menyala
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], HIGH);
  }

  // Nada error lebih jelas: sirene naik-turun
  for (int i = 0; i < 2; i++) {
    tone(buzzpin, NOTE_B5, 300);
    delay(300);
    tone(buzzpin, NOTE_G3, 300);
    delay(300);
  }
  noTone(buzzpin);

  // Matikan semua LED
  for (int i = 0; i < 4; i++) {
    digitalWrite(led[i], LOW);
  }

  // Reset state
  turn = 0;
  seqL = 0;
  played = false;
  generateSeq();
}

void playSeq(int t) {
  for (int i = 0; i < t; i++) {
    int current = seq[i];
    tone(buzzpin, notes[current], 400);
    digitalWrite(led[current], HIGH);
    delay(400);
    digitalWrite(led[current], LOW);
    noTone(buzzpin);
    delay(250);
  }
}

void loop() {
  if (turn == 0) {
    win();
    turn++;
    delay(500);
  }

  if (seqL == 0 && !played) {
    playSeq(turn);
    played = true;
  }
  else if (seqL == turn) {
    win();
    turn++;
    seqL = 0;
    played = false;
    delay(500);
  }
  else {
    for (int i = 0; i < 4; i++) {
      if (digitalRead(button[i]) == LOW) {
        delay(50); // Debounce
        while (digitalRead(button[i]) == LOW); // Wait release

        USeq[seqL] = i;
        digitalWrite(led[i], HIGH);

        if (USeq[seqL] != seq[seqL]) {
          loss();
          return;
        }

        tone(buzzpin, notes[i], 400);
        delay(400);
        digitalWrite(led[i], LOW);
        noTone(buzzpin);
        seqL++;
      }
    }
  }
}